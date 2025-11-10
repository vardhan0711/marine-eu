const API = import.meta.env.VITE_API_URL;

export const fetchRoutes = async () => {
  const res = await fetch(`${API}/routes`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
};
