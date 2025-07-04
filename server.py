from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json, os, subprocess, paramiko
from flask_socketio import SocketIO, emit

app = Flask(__name__)
CORS(app)  # CORS 설정 추가
socketio = SocketIO(app, cors_allowed_origins="*")

BOOKS_FILE = "books.json"
EXPECTED_BARCODES_FILE = "expected_barcodes.json"

RASPBERRY_IP = "192.168.137.82"
RASPBERRY_USER = "pi"
RASPBERRY_PASS = "raspberry"

C_CODE = "/home/pi/barcode_scanner.c"
COMPILED = "/home/pi/scanner"

# JSON 파일에서 책 정보 불러오기
robot_status = "normal"

def load_books():
    return json.load(open(BOOKS_FILE, "r", encoding="utf-8")) if os.path.exists(BOOKS_FILE) else []

books = load_books()

# JSON 파일에 책 정보 저장하기
def save_books():
    json.dump(books, open(BOOKS_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=4)

# 서버 부팅 시 expected_barcodes.json 생성
expected_barcodes = {}

def generate_expected_barcodes():
    global expected_barcodes

    location_dict = {}
    for book in books:
        location = book["location"]
        barcode = book["barcode"]
        position = book["position"]

        if location not in location_dict:
            location_dict[location] = []

        location_dict[location].append((barcode, position))

    # 정렬 후 저장 (position 기준)
    expected_barcodes = {
        location: [barcode for barcode, _ in sorted(barcodes, key=lambda x: x[1])]
        for location, barcodes in location_dict.items()
    }

    # JSON 파일로 저장
    with open(EXPECTED_BARCODES_FILE, "w", encoding="utf-8") as file:
        json.dump(expected_barcodes, file, ensure_ascii=False, indent=4)

    print("expected_barcodes.json 업데이트 완료!")

# 서버 부팅 시 expected_barcodes.json 생성
generate_expected_barcodes()
@app.route('/robot_status', methods=['GET'])
def get_robot_status():
    return jsonify({"status": robot_status})


@app.route('/set_robot_status', methods=['POST'])
def set_robot_status():
    global robot_status
    data = request.get_json()
    status = data.get("status")

    if status in ["normal", "scanning", "complete"]:
        robot_status = status
        return jsonify({"success": True, "status": robot_status})
    else:
        return jsonify({"success": False, "error": "Invalid status"}), 400


@app.route('/')
def home():
    return render_template('index.html', books=books)

@app.route('/books')
def books_page():
    return render_template('books.html', books=books)

@app.route('/book_shelf')
def book_shelf():
    grouped_shelves = {}  # location별로 그룹화된 책 저장
    
    # 책 상태와 그룹화를 처리
    for book in books:
        if book['location'] in ['1F-1-A-1-a', '1F-1-A-2-a', '2F-1-A-1-a', '2F-1-A-2-a']:
            status_label = ""
            color_class = ""

            if book.get("available", False):
                status_label = "책 있음"
                color_class = "available"
            elif not book.get("available", False) and not book.get("misplaced", False) and not book.get("wrong-location", False):
                status_label = "책이 없음"
                color_class = "not-available"
            elif book.get("misplaced", False):
                status_label = "순서 잘못됨"
                color_class = "misplaced"
            elif book.get("wrong-location", False):
                status_label = "잘못 배치됨"
                color_class = "wrong-location"

            # 책을 location별로 그룹화
            if book['location'] not in grouped_shelves:
                grouped_shelves[book['location']] = []

            grouped_shelves[book['location']].append({
                'title': book['title'],
                'barcode': book['barcode'],
                'image_url': book.get('image_url', 'default.jpg'),
                'status_label': status_label,
                'color_class': color_class
            })

    return render_template('book_shelf.html', grouped_shelves=grouped_shelves)


# 1. C 코드 컴파일 및 실행 (터미널에서)
@app.route('/scan', methods=['POST'])
def scan_book():
    global robot_status
    robot_status = "scanning"

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(RASPBERRY_IP, username=RASPBERRY_USER, password=RASPBERRY_PASS)

        # 터미널에서 scanner 실행 (종료는 따로)
        command = (
            f"DISPLAY=:0 lxterminal --command='bash -c \""
            f"gcc {C_CODE} -o {COMPILED} -ljansson -lcurl && "
            f"{COMPILED}; "
            f"exec bash\"'"
        )

        ssh.exec_command(command)

        return jsonify({"success": True, "message": "C 코드 실행 시작 (lxterminal에서)"})
    except Exception as e:
        return jsonify({"success": False, "message": "실행 오류", "error": str(e)})


# 2. scanner 종료 (kill)
@app.route('/scan_exit', methods=['POST'])
def stop_scanner():
    global robot_status
    robot_status = "complete"

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(RASPBERRY_IP, username=RASPBERRY_USER, password=RASPBERRY_PASS)

        # scanner 종료 (터미널 내에서 실행되었기 때문에 -f로 종료)
        stop_command = "pkill -9 -f './scanner'"

        ssh.exec_command(stop_command)

        # lxterminal도 함께 닫으려면 아래 추가
        kill_terminal = "pkill -9 -f lxterminal"
        ssh.exec_command(kill_terminal)

        return jsonify({"success": True, "message": "scanner 및 터미널 종료 완료"})
    except Exception as e:
        return jsonify({"success": False, "message": "종료 오류", "error": str(e)})

    
    
# 책 상태 업데이트 API
@app.route('/update_book_status', methods=['POST'])
def update_book_status():
    global books, expected_barcodes
    
    data = request.get_json()
    scanned = data  # 클라이언트에서 전송한 스캔 데이터 (예: {"3F-A-1-F": ["123", "234", "345", "456", "567"]})
    
    # 스캔된 칸바코드가 있는지 확인
    if not scanned:
        return jsonify({"error": "잘못된 데이터입니다."}), 400
    
    location = list(scanned.keys())[0]  # 예: "3F-A-1-F"
    scanned_barcodes = scanned[location]  # 예: ["123", "234", "345", "456", "567"]
    
    # expected_barcodes.json에서 예상 바코드 목록 가져오기
    if location not in expected_barcodes:
        return jsonify({"error": "잘못된 책장 위치입니다."}), 400
    
    expected_barcodes_list = expected_barcodes[location]  # 예: ["123", "234", "345", "456", "567"]
    expected_set = set(expected_barcodes_list)  # 빠른 검색을 위한 집합 변환
    scanned_set = set(scanned_barcodes)  # 스캔된 바코드 집합 변환
    
    # 1. expected에는 있지만 scanned에는 없는 바코드 찾기 (책이 없는 경우)
    missing_barcodes = expected_set - scanned_set
    
    # 2. expected에는 없지만 scanned에 있는 바코드 찾기 (잘못된 위치)
    wrong_location_barcodes = scanned_set - expected_set
    
    # wrong-location에 해당하는 바코드는 제거
    scanned_barcodes = [b for b in scanned_barcodes if b not in wrong_location_barcodes]
    
    # 3. 버퍼에 분배
    buffers = []  # 여러 개의 버퍼 (각각의 버퍼는 순서대로 스캔된 바코드들)
    
    # 첫 번째 바코드는 첫 번째 버퍼에 넣기
    current_buffer = [scanned_barcodes[0]]
    
    # 나머지 바코드는 이전 바코드와의 순서를 비교하여 버퍼에 나누어 넣기
    for i in range(1, len(scanned_barcodes)):
        prev_barcode = scanned_barcodes[i - 1]
        curr_barcode = scanned_barcodes[i]
        
        # prev_barcode가 current_buffer의 마지막 바코드보다 앞선 순서일 경우
        if expected_barcodes_list.index(curr_barcode) > expected_barcodes_list.index(prev_barcode):
            current_buffer.append(curr_barcode)
        else:
            # 새로운 버퍼를 시작
            buffers.append(current_buffer)
            current_buffer = [curr_barcode]
    
    # 마지막 버퍼도 추가
    buffers.append(current_buffer)
    
    # 가장 큰 버퍼를 available로 간주
    largest_buffer = max(buffers, key=len)
    
    available_barcodes = []
    misplaced_barcodes = []
    
    for buffer in buffers:
        if buffer == largest_buffer:
            available_barcodes.extend(buffer)  # 가장 큰 버퍼의 바코드는 available
        else:
            misplaced_barcodes.extend(buffer)  # 나머지 버퍼의 바코드는 misplaced
    
    # 책 상태 업데이트
    for book in books:
        if book["barcode"] in available_barcodes:
            book["available"] = True
            book["misplaced"] = False
            book["wrong-location"] = False
        elif book["barcode"] in misplaced_barcodes:
            book["available"] = False
            book["misplaced"] = True
            book["wrong-location"] = False
        elif book["barcode"] in wrong_location_barcodes:
            book["available"] = False
            book["misplaced"] = False
            book["wrong-location"] = True
        elif book["barcode"] in missing_barcodes:
            book["available"] = False
            book["misplaced"] = False
            book["wrong-location"] = False
    
    save_books()  # 변경된 책 상태 저장

    socketio.emit('refresh', {'message': 'update_detected'})
    
    return jsonify({
        "available": available_barcodes,
        "misplaced": misplaced_barcodes,
        "wrong-location": list(wrong_location_barcodes),
        "not-available": list(missing_barcodes)
    }), 200

    

@app.route('/get_books', methods=['GET'])
def get_books():
    return jsonify(books)

@app.route('/search')
def search_books():
    query = request.args.get('query', '').lower()
    books = load_books()
    filtered_books = [book for book in books if query in book['title'].lower() or query in book['author'].lower()]
    return jsonify(filtered_books)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
