'use client';

import { useState } from 'react';
import { signup, login } from './actions';
import axios from 'axios';

const LoginPage = () => {
  const [LoginResult, setLoginResult] = useState<string | null>(null);
  const [SignupResult, setSignupResult] = useState<string | null>(null);

  const handleLogin = async (formValues) => {
    setLoginResult(null);

    const res = await login(formValues);

    if (res.error) {
      setLoginResult(`Error ${res.error.code}: ${res.error.message}`);
      return;
    }

    setLoginResult('Email sent!');
  };

  const handleSignup = async (formValues) => {
    setSignupResult(null);

    const email = formValues.get('email') as string;
    const code = formValues.get('invite');

    const inviteData = {
      email,
      code,
    };

    const inviteRes = await axios.post('api/useInvite', inviteData);

    if (inviteRes.data.error) {
      setSignupResult(`Error claiming invitation`);
    }

    const res = await signup(formValues);

    if (res.error) {
      setSignupResult(`Error ${res.error.code}: ${res.error.message}`);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-700 text-zinc-300">
      <h1 className="mb-8">Day Trip</h1>
      <div className="w-full max-w-[300px] border-b border-zinc-400 pb-4">
        <h3 className="mb-2 text-center uppercase">Login</h3>
        <form className="flex flex-col gap-2">
          <label htmlFor="login-email">Email:</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="form-element bg-zinc-200 text-zinc-900"
          />

          <div className="flex flex-col items-center gap-2">
            <button
              className="form-element bg-zinc-800"
              formAction={handleLogin}
            >
              Email login link
            </button>
          </div>
        </form>
        {LoginResult && <div className="mt-4 text-center">{LoginResult}</div>}
      </div>

      <div className="w-full max-w-[300px]">
        <h3 className="mb-2 text-center uppercase">Sign up</h3>
        <form className="flex w-full max-w-[500px] flex-col gap-2">
          <label htmlFor="signup-email">Email:</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="form-element bg-zinc-200 text-zinc-900"
          />
          <label htmlFor="invite-code">Invite code:</label>
          <input
            id="invite-code"
            name="invite"
            type="text"
            autoComplete="off"
            required
            className="form-element bg-zinc-200 text-zinc-900"
          />

          <div className="flex flex-col items-center gap-2">
            <button
              className="form-element bg-zinc-800"
              formAction={handleSignup}
            >
              Claim invitation
            </button>
          </div>
        </form>
        {SignupResult && <div className="mt-4 text-center">{SignupResult}</div>}
      </div>
    </div>
  );
};

export default LoginPage;
