import sqlite3
import sys

DB_NAME = "interview.db"


def set_admin():
    email = input("Введите email пользователя, которого сделать админом: ").strip()

    if not email:
        print("Email не может быть пустым.")
        return

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        cursor.execute("SELECT id, username, role FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if not user:
            print(f"❌ Пользователь с email '{email}' не найден!")
            return

        print(f"Найден пользователь: ID={user[0]}, Name={user[1]}, Role={user[2]}")

        cursor.execute("UPDATE users SET role = 'admin' WHERE email = ?", (email,))
        conn.commit()

        print(f"✅ Успешно! Пользователь {email} теперь ADMIN.")

    except sqlite3.Error as e:
        print(f"Ошибка базы данных: {e}")
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    set_admin()