// Helper to construct full image URLs from relative paths
export const getFullImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
    
    // Normalize path separators (win32 paths to web paths)
    const normalizedPath = path.replace(/\\/g, '/');

    // Fallback to localhost:5000 if env var not set
    const baseUrl = (import.meta as any).env?.VITE_API_URL 
      ? (import.meta as any).env.VITE_API_URL.replace(/\/api\/?$/, '') 
      : 'http://localhost:5000';
      
    // Ensure path doesn't start with slash for clean joining
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
    
    return `${baseUrl}/${cleanPath}`;
  };