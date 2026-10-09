// Favorite / Bookmarked Jobs & Workers Storage utility

const FAVORITE_JOBS_KEY = 'dw_favorite_jobs_v1';
const FAVORITE_WORKERS_KEY = 'dw_favorite_workers_v1';

export function getFavoriteJobIds(): string[] {
  try {
    const data = localStorage.getItem(FAVORITE_JOBS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isJobFavorite(jobId: string): boolean {
  const favorites = getFavoriteJobIds();
  return favorites.includes(jobId);
}

export function toggleJobFavorite(jobId: string): boolean {
  try {
    const favorites = getFavoriteJobIds();
    const index = favorites.indexOf(jobId);
    let updated: string[];
    let isFav = false;
    if (index > -1) {
      updated = favorites.filter((id) => id !== jobId);
      isFav = false;
    } else {
      updated = [jobId, ...favorites];
      isFav = true;
    }
    localStorage.setItem(FAVORITE_JOBS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('dw_favorites_updated'));
    return isFav;
  } catch {
    return false;
  }
}

export function getFavoriteWorkerIds(): string[] {
  try {
    const data = localStorage.getItem(FAVORITE_WORKERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isWorkerFavorite(workerId: string): boolean {
  const favorites = getFavoriteWorkerIds();
  return favorites.includes(workerId);
}

export function getFavoriteCount(): number {
  return getFavoriteJobIds().length + getFavoriteWorkerIds().length;
}


export function toggleWorkerFavorite(workerId: string): boolean {
  try {
    const favorites = getFavoriteWorkerIds();
    const index = favorites.indexOf(workerId);
    let updated: string[];
    let isFav = false;
    if (index > -1) {
      updated = favorites.filter((id) => id !== workerId);
      isFav = false;
    } else {
      updated = [workerId, ...favorites];
      isFav = true;
    }
    localStorage.setItem(FAVORITE_WORKERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('dw_favorites_updated'));
    return isFav;
  } catch {
    return false;
  }
}
