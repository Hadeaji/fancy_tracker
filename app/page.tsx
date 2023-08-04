"use client";
import { FormEvent, useState } from 'react';

export default function Home() {
  const [github, setGithub] = useState<string>('');
  const [githubStatus, setGithubStatus] = useState<"Awaiting Input" | "Loading..." | "Failed" | "Success">('Awaiting Input');

  const [linkedinPass, setLinkedinPass] = useState<string>('');
  const [linkedinEmail, setLinkedinEmail] = useState<string>('');
  const [linkedinStatus, setLinkedinStatus] = useState<"Awaiting Input" | "Loading..." | "Failed" | "Success">('Awaiting Input');
  const [verification, setVerification] = useState<string>('');

  const handleGithub = async (e: FormEvent) => {
    e.preventDefault();
    setGithubStatus('Loading...');

    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ github }),
      });

      if (response.status == 200) {
        setGithubStatus('Success');
        console.log('Data submitted successfully!');
      } else {
        setGithubStatus('Failed');
        console.error('Failed to submit data.');
      }
    } catch (error) {
      setGithubStatus('Failed');
      console.error('An error occurred:', error);
    }
  };

  const handleLinkedin = async (e: FormEvent) => {
    e.preventDefault();
    setLinkedinStatus('Loading...');

    try {
      const response = await fetch('/api/linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkedinPass, linkedinEmail, verification}),
      });

      if (response.status == 200) {
        setLinkedinStatus('Success');
        console.log('Data submitted successfully!');
      } else {
        setLinkedinStatus('Failed');
        console.error('Failed to submit data.');
      }
    } catch (error) {
      setLinkedinStatus('Failed');
      console.error('An error occurred:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={handleGithub} className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="flex gap-4">
          <p>
            insert github link
          </p>
          <input
            type="text"
            className="text-black"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
          />
        </div>

        <div className="flex">
          <p>
            status: <span>{githubStatus}</span>
          </p>
        </div>

        <div className="flex h-48 w-full items-end justify-center">
          <button type="submit">Submit</button>
        </div>
      </form>

      <form onSubmit={handleLinkedin} className="">
        <div className="flex gap-4">
          <p>
            linkedin email
          </p>
          <input
            type="text"
            className="text-black"
            value={linkedinEmail}
           onChange={(e) => setLinkedinEmail(e.target.value) }
          />
          <p>
            linkedin pass
          </p>
          <input
            type="password"
            className="text-black"
            value={linkedinPass}
          onChange={(e) => setLinkedinPass(e.target.value) }
          />

          <p>
            2FA
          </p>
          <input
            type="password"
            className="text-black"
            value={verification}
           onChange={(e) => setVerification(e.target.value) }
          />
        </div>

        <div className="flex">
          <p>
            status: <span>{linkedinStatus}</span>
          </p>
        </div>

        <div className="flex h-48 w-full items-end justify-center">
          <button type="submit">Submit</button>
        </div>
      </form>

    </main>
  )
}
