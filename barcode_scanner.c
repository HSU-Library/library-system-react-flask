#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <termios.h>
#include <jansson.h>
#include <curl/curl.h>
#include <ctype.h>

#define SERVER_URL "http://223.194.154.103:5001/update_book_status"
#define MAX_BARCODE_LEN 128
#define MAX_BARCODES 100

// 터미널을 비차단 모드로 설정
void set_terminal_mode(struct termios *original) {
    struct termios new_settings;
    tcgetattr(STDIN_FILENO, original);
    new_settings = *original;
    new_settings.c_lflag &= ~(ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &new_settings);
}

// 터미널을 원래 상태로 복원
void reset_terminal_mode(struct termios *original) {
    tcsetattr(STDIN_FILENO, TCSANOW, original);
}

// 중복 바코드인지 확인
int is_duplicate(char barcodes[][MAX_BARCODE_LEN], int count, const char *barcode) {
    for (int i = 0; i < count; i++) {
        if (strcmp(barcodes[i], barcode) == 0) {
            return 1;
        }
    }
    return 0;
}

// 책장 코드인지 판별 (대소문자 구분 없이 -f로 시작)
int is_shelf_code(const char *buffer) {
    return strchr(buffer, '-') && tolower(buffer[1]) == 'f';
}

// JSON 데이터를 생성하여 서버에 전송
void send_to_server(const char *location, char barcodes[][MAX_BARCODE_LEN], int count) {
    CURL *curl;
    CURLcode res;
    struct curl_slist *headers = NULL;
    json_t *root, *barcode_array;
    char *json_data;

    root = json_object();
    barcode_array = json_array();
    for (int i = 0; i < count; i++) {
        json_t *barcode_str = json_string(barcodes[i]);
        if (barcode_str) {
            json_array_append_new(barcode_array, barcode_str);
        } else {
            fprintf(stderr, "바코드 문자열 변환 실패: %s\n", barcodes[i]);
        }
    }
    json_object_set_new(root, location, barcode_array);

    json_data = json_dumps(root, 0);
    json_decref(root);

    if (!json_data) {
        fprintf(stderr, "JSON 변환 실패. 데이터가 전송되지 않습니다.\n");
        return;
    }

    curl_global_init(CURL_GLOBAL_ALL);
    curl = curl_easy_init();
    if (curl) {
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_URL, SERVER_URL);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_data);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        res = curl_easy_perform(curl);
        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        } else {
            printf("%s 책장의 데이터가 서버로 전송되었습니다.\n", location);
        }

        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    } else {
        fprintf(stderr, "curl 초기화 실패\n");
    }

    curl_global_cleanup();
    free(json_data);
}

int main() {
    struct termios original_settings;
    char buffer[MAX_BARCODE_LEN];
    int index = 0;
    char scanning_location[MAX_BARCODE_LEN] = "";
    char barcodes[MAX_BARCODES][MAX_BARCODE_LEN];
    int barcode_count = 0;
    int unique_count = 0;

    set_terminal_mode(&original_settings);
    printf("바코드를 스캔하세요 (종료하려면 'exit' 입력):\n");

    while (1) {
        char c = getchar();
        if (c == '\n') {
            buffer[index] = '\0';
            if (strcmp(buffer, "exit") == 0) {
                break;
            }

            if (is_shelf_code(buffer)) {
                if (strlen(scanning_location) == 0) {
                    strcpy(scanning_location, buffer);
                    barcode_count = 0;
                    unique_count = 0;
                    printf("%s 책장 스캔 시작!\n", scanning_location);
                } else if (strcmp(scanning_location, buffer) == 0) {
                    if (unique_count >= 2) {
                        printf("%s 책장 스캔 종료! 데이터 전송 중...\n", scanning_location);
                        send_to_server(scanning_location, barcodes, barcode_count);
                        scanning_location[0] = '\0';
                    } else {
                        printf("책을 최소 2권 이상 스캔해야 책장 스캔을 종료할 수 있습니다.\n");
                    }
                } else {
                    printf("다른 책장(%s)의 스캔이 진행 중입니다. 먼저 종료하세요.\n", scanning_location);
                }
            } else if (strlen(scanning_location) > 0) {
                if (is_duplicate(barcodes, barcode_count, buffer)) {
                    printf("중복된 책 바코드(%s)입니다. 무시됩니다.\n", buffer);
                } else if (barcode_count < MAX_BARCODES) {
                    strcpy(barcodes[barcode_count++], buffer);
                    unique_count++;
                    printf("책 %s 스캔됨. (버퍼에 저장됨)\n", buffer);
                } else {
                    printf("버퍼가 가득 찼습니다. 책장 스캔을 종료하고 데이터를 전송하세요.\n");
                }
            } else {
                printf("먼저 책장 바코드를 입력하여 스캔을 시작하세요.\n");
            }

            index = 0;
        } else {
            if (index < MAX_BARCODE_LEN - 1) {
                buffer[index++] = c;
            }
        }
    }

    reset_terminal_mode(&original_settings);
    printf("프로그램을 종료합니다.\n");
    return 0;
}

