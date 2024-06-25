'use client';

import { useEffect, useState } from 'react';
import { signup, login } from './actions';

const LoginPage = () => {
  const toggleReveal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = document.querySelector<HTMLInputElement>('#password');
    if (password) {
      password.type = e.target.checked ? 'text' : 'password';
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center px-4">
      <form className="flex w-full max-w-[400px] flex-col gap-2">
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />
        <div className="flex justify-between">
          <label htmlFor="password">Password:</label>
          <label htmlFor="reveal">
            Reveal:
            <input
              id="reveal"
              name="reveal"
              type="checkbox"
              onChange={toggleReveal}
            />
          </label>
        </div>
        <input id="password" name="password" type="password" required />

        <div className="flex flex-col items-center gap-2">
          <button className="button" formAction={login}>
            Log in
          </button>
          <button className="button" formAction={signup}>
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
