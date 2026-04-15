import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { access_token: 'fake', refresh_token: 'fake' } })),
    get: vi.fn(() => Promise.resolve({ data: { id: 1, username: 'test', role: 'user' } })),
  }
}));

describe('Login Page', () => {
  it('позволяет вводить данные в форму', async () => {
    render(
      <BrowserRouter><AuthProvider><Login /></AuthProvider></BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');

    await userEvent.type(emailInput, 'test@mail.com');
    await userEvent.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@mail.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('отправляет данные на сервер при нажатии кнопки', async () => {
    render(
      <BrowserRouter><AuthProvider><Login /></AuthProvider></BrowserRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Email'), 'admin@mail.ru');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), '12345');

    const submitButton = screen.getByRole('button', { name: /войти/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@mail.ru',
        password: '12345'
      });
    });
  });
});