function decodeToken(token: string) {
  try {
    // Base64 dekodieren (der Teil zwischen den Punkten)
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token konnte nicht dekodiert werden:", error);
    return null;
  }
}

export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  const decodedToken = decodeToken(token);
  return decodedToken.id || null;
}


export function getRoleFromToken(token: string): string[] {
  const decoded = decodeToken(token) as { role: string[] };
  const roleArray: string[] = [];
  decoded.role.forEach((element) => {
    roleArray.push(element);
  });
  return roleArray;
}
