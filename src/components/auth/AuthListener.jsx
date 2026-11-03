import { useEffect } from "react";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../stores/useAuthStore";

export function AuthListener() {
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const unsubscribe = authService.onAuthChanged((user) => {
      setUser(user);
      if (!user) setProfile(null);
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setProfile, setLoading]);

  return null;
}
