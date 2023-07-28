"use client";
import { FormEvent, useState } from 'react';

export default function Home() {
  const [github, setGithub] = useState<string>('');
  const [githubStatus, setGithubStatus] = useState<"Awaiting Input" | "Loading..." | "Failed" | "Success">('Awaiting Input');

  const handleSubmit = async (e: FormEvent) => {
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


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={handleSubmit} className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
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

      <form onSubmit={handleSubmit} className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="flex gap-4">
          <p>
            linkedin email
          </p>
          <input
            type="text"
            className="text-black"
            value={github}
          // onChange={(e) => }
          />
          <p>
            linkedin pass
          </p>
          <input
            type="text"
            className="text-black"
            value={github}
          // onChange={(e) => }
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

    </main>
  )
}
