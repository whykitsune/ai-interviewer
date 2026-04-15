import sqlite3
import os

DB_NAME = "interview.db"


def check_users():
    if not os.path.exists(DB_NAME):
        print(f"❌ ОШИБКА: Файл {DB_NAME} не найден в этой папке!")
        print(f"Текущая папка: {os.getcwd()}")
        return

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        print(f"--- Подключение к базе: {DB_NAME} ---")

        cursor.execute("SELECT id, username, email, role FROM users")
        users = cursor.fetchall()

        if not users:
            print("В базе нет ни одного пользователя!")
        else:
            print(f"{'ID':<5} {'Role':<10} {'Email':<30} {'Username'}")
            print("-" * 60)
            for user in users:
                id_, name, email, role = user

                prefix = "✅ " if role == 'admin' else "   "
                print(f"{prefix}{id_:<4} {role:<10} {email:<30} {name}")

    except sqlite3.Error as e:
        print(f"Ошибка SQL: {e}")
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    check_users()