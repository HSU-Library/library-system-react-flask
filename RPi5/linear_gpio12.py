import lgpio
import time



STOP_PIN = 12

h = lgpio.gpiochip_open(0)
lgpio.gpio_claim_output(h, STOP_PIN)

lgpio.gpio_write(h, STOP_PIN, 0)  # 정지 LOW

print("이동 명령 전송 (GPIO12 LOW)")

time.sleep(1)
lgpio.gpiochip_close(h)

