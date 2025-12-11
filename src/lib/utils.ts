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
  if (!pod || !userId) return false;
  
  // Check if user is the owner
  if (pod.ownerId === userId) return true;
  
  // Check if user is a co-owner (from userRole or isCoOwner flag from backend)
  if (pod.userRole === 'co-owner' || pod.isCoOwner === true) return true;
  
  // Fallback: Check coOwnerIds array (for backward compatibility)
  if (pod.coOwnerIds && pod.coOwnerIds.includes(userId)) return true;
  
  // Fallback: Check coOwners array
  if (pod.coOwners && pod.coOwners.some(co => co.id === userId)) return true;
  
  return false;
}

/**
 * Get pods that the user can manage (owned or co-owner)
 */
export function getManagedPods(pods: Pod[], userId: string | undefined): Pod[] {
  if (!userId) return [];
  return pods.filter(pod => canManagePod(pod, userId));
}
