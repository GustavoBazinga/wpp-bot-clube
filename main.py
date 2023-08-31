import os
import time

def test_connection(ip):
    os.system(f"ping {ip} -n 1")

if __name__ == '__main__':
    for i in range(20,67,1):
        print(f"Pingando {i}")
        test_connection(f"192.168.40.{i}")