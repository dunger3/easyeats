import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CaptchaService {
  private store = new Map<string, { code: string; expiresAt: number }>();

  generate() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const token = uuidv4();
    this.store.set(token, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    // Sweep expired entries
    for (const [k, v] of this.store.entries()) {
      if (v.expiresAt < Date.now()) {
        this.store.delete(k);
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" width="150" height="60">
        <rect width="150" height="60" fill="#f5f5f5" stroke="#ccc"/>
        <text x="50%" y="50%" font-size="28" font-family="Arial" fill="#000"
              dominant-baseline="middle" text-anchor="middle" letter-spacing="5">${code}</text>
      </svg>`;
    return { token, svg };
  }

  verify(token: string, userCode: string): boolean {
    const entry = this.store.get(token);
    if (!entry || entry.expiresAt < Date.now()) {
      this.store.delete(token);
      return false;
    }
    const ok = entry.code.toUpperCase() === userCode.toUpperCase();
    if (ok) {
      this.store.delete(token); // one-time use
    }
    return ok;
  }
}
