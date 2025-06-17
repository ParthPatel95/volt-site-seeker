
import { userAgents } from './config.ts';

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRandomUserAgent(): string {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export function isAntiBot(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return lowerHtml.includes('cloudflare') || 
         lowerHtml.includes('captcha') || 
         lowerHtml.includes('access denied') ||
         lowerHtml.includes('blocked');
}
