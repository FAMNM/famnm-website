// import type React from 'react';

import type { FormEvent } from 'react';

export default function overrideSubmit(f: () => void) {
  return (event: FormEvent) => {
    event.preventDefault();
    f();
  };
}
