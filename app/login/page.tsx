'use client';

import { signup, login } from './actions';

const LoginPage = () => {
  const toggleReveal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = document.querySelector<HTMLInputElement>('#password');
    if (password) {
      password.type = e.target.checked ? 'text' : 'password';
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-700 text-zinc-300">
      <h1 className="mb-8">Day Trip</h1>
      <div className="w-full max-w-[300px] border-b border-zinc-400 pb-4">
        <h3 className="mb-2 text-center uppercase">Login</h3>
        <form className="flex flex-col gap-2">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="form-element bg-zinc-200 text-zinc-900"
          />

          <div className="flex flex-col items-center gap-2">
            <button className="form-element bg-zinc-800" formAction={login}>
              Email login link
            </button>
          </div>
        </form>
      </div>

      <div className="w-full max-w-[300px]">
        <h3 className="mb-2 text-center uppercase">Sign up</h3>
        <form className="flex w-full max-w-[500px] flex-col gap-2">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="form-element bg-zinc-200 text-zinc-900"
          />
          <label htmlFor="invite">Invite code:</label>
          <input
            id="invite"
            name="invite"
            type="text"
            autoComplete="off"
            required
            className="form-element bg-zinc-200 text-zinc-900"
          />

          <div className="flex flex-col items-center gap-2">
            <button className="form-element bg-zinc-800" formAction={signup}>
              Claim invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
