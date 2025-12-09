// User Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  username: string;
  profilePhoto?: string;
  role: 'user' | 'pod_owner' | 'USER' | 'POD_OWNER';
  createdAt: Date;
}

export interface UserProfile extends User {
  organisationName?: string;
  profilePicture?: string;
  brandName?: string;
  designation?: string;
  workingExperienceFrom?: Date;
  workingExperienceTo?: Date;
  startupSubcategory?: string;
  businessType?: string;
  briefAboutOrganisation?: string;
  operatingCity?: string;
  website?: string;
  socialLinks: SocialLinks;
}

export interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

// Pod Types
export interface Pod {
  id: string;
  name: string;
  logo?: string;
  subcategory: PodSubcategory;
  focusAreas: string[];
  organisationName: string;
  organisationType: 'GOVERNMENT' | 'PRIVATE';
  operatingCity: string;
  totalInvestmentSize?: string;
  numberOfInvestments?: number;
  briefAboutOrganisation?: string;
  socialLinks: SocialLinks;
  ownerId: string;
  owner?: User;
  coOwnerIds: string[];
  coOwners?: User[];
  memberIds: string[];
  isApproved: boolean;
  isVerified?: boolean;
  createdAt: Date;
}

export type PodSubcategory =
  | 'INCUBATION'
  | 'COMMUNITY'
  | 'VENTURE_CAPITALIST'
  | 'ANGEL_INVESTOR'
  | 'ANGEL_NETWORK'
  | 'SERVICE_PROVIDER'
  | 'ACCELERATOR'
  | 'CORPORATE_INNOVATION'
  | 'GOVERNMENT_PROGRAM'
  | 'UNIVERSITY_ENTREPRENEURSHIP_CELL';

export const POD_SUBCATEGORIES: PodSubcategory[] = [
  'INCUBATION',
  'COMMUNITY',
  'VENTURE_CAPITALIST',
  'ANGEL_INVESTOR',
  'ANGEL_NETWORK',
  'SERVICE_PROVIDER',
  'ACCELERATOR',
  'CORPORATE_INNOVATION',
  'GOVERNMENT_PROGRAM',
  'UNIVERSITY_ENTREPRENEURSHIP_CELL',
];

// Helper to convert enum to display name
export const POD_SUBCATEGORY_DISPLAY: Record<PodSubcategory, string> = {
  'INCUBATION': 'Incubation',
  'COMMUNITY': 'Community',
  'VENTURE_CAPITALIST': 'Venture Capitalist',
  'ANGEL_INVESTOR': 'Angel Investor',
  'ANGEL_NETWORK': 'Angel Network',
  'SERVICE_PROVIDER': 'Service Provider',
  'ACCELERATOR': 'Accelerator',
  'CORPORATE_INNOVATION': 'Corporate Innovation',
  'GOVERNMENT_PROGRAM': 'Government Program',
  'UNIVERSITY_ENTREPRENEURSHIP_CELL': 'University Entrepreneurship Cell',
};

// Post Types
export interface Post {
  id: string;
  authorId: string;
  author: User;
  podId: string;
  content: string;
  mediaUrls: string[];
  mediaType?: 'image' | 'video';
  likes: string[];
  comments: Comment[];
  isOwnerPost: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: Date;
}

// Room Types
export interface Room {
  id: string;
  name: string;
  description?: string;
  podId: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  type: 'GENERAL' | 'QA';
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  pod?: {
    id: string;
    name: string;
  };
  _count?: {
    messages: number;
  };
}

export interface Message {
  id: string;
  roomId?: string;
  chatId?: string;
  senderId: string;
  sender: User;
  content: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  roomId: string;
  authorId: string;
  author: User;
  content: string;
  answers: Answer[];
  createdAt: Date;
}

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: Date;
}

// Event Types
export interface PodEvent {
  id: string;
  podId: string;
  name: string;
  title?: string;
  description?: string;
  type: string; // "ONLINE" | "OFFLINE"
  date: Date | string;
  time: string;
  location?: string;
  helpline?: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  pod?: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants?: Array<{
    id: string;
    userId: string;
    user: User;
  }>;
}

// Pitch Types
export interface PitchReply {
  id: string;
  pitchId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: Date;
}

export interface Pitch {
  id: string;
  podId: string;
  podName?: string;
  founderId: string;
  founder: User;
  startupName: string;
  pitchDeckUrl?: string;
  summary: string;
  sector: string;
  stage: StartupStage;
  ask: string;
  operatingCity: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
  status: PitchStatus;
  replies: PitchReply[];
  createdAt: Date;
}

export type StartupStage = 'IDEA' | 'MVP' | 'EARLY_TRACTION' | 'GROWTH' | 'SCALE';
export type PitchStatus = 'NEW' | 'VIEWED' | 'REPLIED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';

export const STARTUP_STAGES: StartupStage[] = ['IDEA', 'MVP', 'EARLY_TRACTION', 'GROWTH', 'SCALE'];
export const PITCH_STATUSES: PitchStatus[] = ['NEW', 'VIEWED', 'REPLIED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];

// Display mappings for enums
export const STARTUP_STAGE_DISPLAY: Record<StartupStage, string> = {
  'IDEA': 'Idea',
  'MVP': 'MVP',
  'EARLY_TRACTION': 'Early Traction',
  'GROWTH': 'Growth',
  'SCALE': 'Scale',
};

export const PITCH_STATUS_DISPLAY: Record<PitchStatus, string> = {
  'NEW': 'New',
  'VIEWED': 'Viewed',
  'REPLIED': 'Replied',
  'SHORTLISTED': 'Shortlisted',
  'ACCEPTED': 'Accepted',
  'REJECTED': 'Rejected',
};

// Chat Types
export interface Chat {
  id: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: Message;
  updatedAt: Date;
}

// Message Request Types
export type MessageRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface MessageRequest {
  id: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  initialMessage: string;
  status: MessageRequestStatus;
  createdAt: Date;
  respondedAt?: Date;
}

// Call Booking Types
export type CallBookingStatus = 'pending' | 'accepted' | 'rejected';

export interface CallBooking {
  id: string;
  podId: string;
  podName?: string;
  pod?: { id: string; name: string; logo?: string };
  requesterId: string;
  requester?: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    organisationName?: string;
    designation?: string;
    email?: string;
    mobile?: string;
  };
  targetUserId: string;
  target?: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    organisationName?: string;
    designation?: string;
  };
  targetRole: 'owner' | 'co-owner';
  purpose: string;
  preferredDate?: Date;
  preferredTime?: string;
  status: CallBookingStatus;
  remark?: string;
  createdAt: Date;
  respondedAt?: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'pod_join' | 'post_like' | 'comment' | 'message' | 'pitch' | 'event';
  title: string;
  message: string;
  isRead: boolean;
  linkedId?: string;
  createdAt: Date;
}

// Business Types for Dropdowns
export const BUSINESS_TYPES = [
  'B2B',
  'B2C',
  'B2B2C',
  'D2C',
  'SaaS',
  'Marketplace',
  'Platform',
  'Service',
  'Product',
  'Hybrid',
];

export const STARTUP_SUBCATEGORIES = [
  'FinTech',
  'EdTech',
  'HealthTech',
  'AgriTech',
  'CleanTech',
  'DeepTech',
  'AI/ML',
  'IoT',
  'E-commerce',
  'Social Impact',
  'Gaming',
  'Media & Entertainment',
  'Logistics',
  'Real Estate',
  'Travel & Hospitality',
  'Food & Beverage',
  'Fashion',
  'Automotive',
  'Energy',
  'Other',
];

export const FOCUS_AREAS = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B+',
  'FinTech',
  'EdTech',
  'HealthTech',
  'DeepTech',
  'CleanTech',
  'Consumer',
  'Enterprise',
  'SaaS',
  'Hardware',
  'Social Impact',
];

export const SECTORS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'Agriculture',
  'Energy',
  'Manufacturing',
  'Real Estate',
  'Transportation',
  'Media',
  'Other',
];
