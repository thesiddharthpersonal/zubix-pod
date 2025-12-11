import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Pod } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a user can manage a pod (is owner or co-owner)
 */
export function canManagePod(pod: Pod | undefined | null, userId: string | undefined): boolean {
  if (!pod || !userId) {
    console.log('canManagePod: No pod or userId', { pod: !!pod, userId });
    return false;
  }
  
  // Check if user is the owner
  if (pod.ownerId === userId) {
    console.log('canManagePod: User is owner', { podId: pod.id, podName: pod.name });
    return true;
  }
  
  // Check if user is a co-owner (from userRole or isCoOwner flag from backend)
  if (pod.userRole === 'co-owner' || pod.isCoOwner === true) {
    console.log('canManagePod: User is co-owner (from userRole/isCoOwner)', { 
      podId: pod.id, 
      podName: pod.name,
      userRole: pod.userRole,
      isCoOwner: pod.isCoOwner 
    });
    return true;
  }
  
  // Fallback: Check coOwnerIds array (for backward compatibility)
  if (pod.coOwnerIds && pod.coOwnerIds.includes(userId)) {
    console.log('canManagePod: User is co-owner (from coOwnerIds)', { 
      podId: pod.id, 
      podName: pod.name,
      coOwnerIds: pod.coOwnerIds 
    });
    return true;
  }
  
  // Fallback: Check coOwners array
  if (pod.coOwners && pod.coOwners.some(co => co.id === userId)) {
    console.log('canManagePod: User is co-owner (from coOwners array)', { 
      podId: pod.id, 
      podName: pod.name,
      coOwners: pod.coOwners.map(co => co.id)
    });
    return true;
  }
  
  console.log('canManagePod: User has no management rights', { 
    podId: pod.id, 
    podName: pod.name,
    userId,
    ownerId: pod.ownerId,
    userRole: pod.userRole,
    isCoOwner: pod.isCoOwner,
    coOwnerIds: pod.coOwnerIds,
    coOwnersCount: pod.coOwners?.length
  });
  return false;
}

/**
 * Get pods that the user can manage (owned or co-owner)
 */
export function getManagedPods(pods: Pod[] | undefined | null, userId: string | undefined): Pod[] {
  console.log('getManagedPods called', { podsCount: pods?.length, userId });
  if (!userId || !pods || pods.length === 0) {
    console.log('getManagedPods: returning empty - no userId or pods');
    return [];
  }
  const managed = pods.filter(pod => canManagePod(pod, userId));
  console.log('getManagedPods: result', { managedCount: managed.length });
  return managed;
}
