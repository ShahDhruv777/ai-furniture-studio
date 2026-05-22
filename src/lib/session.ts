// Anonymous browser session id, used to scope saved customizations + favorites.
export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("furni_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("furni_session_id", id);
  }
  return id;
}
