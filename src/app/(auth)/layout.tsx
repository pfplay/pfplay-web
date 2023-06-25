import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import React from 'react';

export default function AuthLayout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

