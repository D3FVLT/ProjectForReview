export function callbackArgs(s: string) {
  return s.split('#', 2)[1].split(',');
}

export function callbackData(name: string, ...xs: (string | number)[]) {
  return `${name}#` + xs.map(String).join(',');
}

export function commandArgs(s?: string) {
  return s?.split(/\s+/).slice(1) ?? [];
}

export const userLink = (firstName: string, userId: string) =>
  `<a href="tg://user?id=${userId}">${firstName}</a>`;
