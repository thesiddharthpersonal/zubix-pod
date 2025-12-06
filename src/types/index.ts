// User Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  username: string;
  profilePhoto?: string;
  role: 'user' | 'pod_owner';
  createdAt: Date;
}

export interface UserProfile extends User {
  organisationName?: string;
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
  organisationType: 'Government' | 'Private';
  operatingCity: string;
  totalInvestmentSize?: string;
  numberOfInvestments?: number;
  briefAboutOrganisation?: string;
  socialLinks: SocialLinks;
  ownerId: string;
  owner?: User;
  coOwnerIds: string[];
  memberIds: string[];
  isApproved: boolean;
  isVerified?: boolean;
  createdAt: Date;
}

export type PodSubcategory =
  | 'Incubation'
  | 'Community'
  | 'Venture Capitalist'
  | 'Angel Investor'
  | 'Angel Network'
  | 'Service Provider'
  | 'Accelerator'
  | 'Corporate Innovation'
  | 'Government Program'
  | 'University Entrepreneurship Cell';

export const POD_SUBCATEGORIES: PodSubcategory[] = [
  'Incubation',
  'Community',
  'Venture Capitalist',
  'Angel Investor',
  'Angel Network',
  'Service Provider',
  'Accelerator',
  'Corporate Innovation',
  'Government Program',
  'University Entrepreneurship Cell',
];

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
  podId: string;
  privacy: 'public' | 'private';
  type: 'general' | 'qa';
  memberIds: string[];
  createdBy: string;
  createdAt: Date;
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
  type: 'online' | 'offline';
  date: Date;
  time: string;
  location?: string;
  description: string;
  helpline?: string;
  registeredUserIds: string[];
  createdBy: string;
  createdAt: Date;
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

export type StartupStage = 'Idea' | 'MVP' | 'Early Traction' | 'Growth' | 'Scale';
export type PitchStatus = 'New' | 'Viewed' | 'Replied' | 'Shortlisted' | 'Accepted' | 'Rejected';

export const STARTUP_STAGES: StartupStage[] = ['Idea', 'MVP', 'Early Traction', 'Growth', 'Scale'];
export const PITCH_STATUSES: PitchStatus[] = ['New', 'Viewed', 'Replied', 'Shortlisted', 'Accepted', 'Rejected'];

// Chat Types
export interface Chat {
  id: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: Message;
  updatedAt: Date;
}

// Message Request Types
export type MessageRequestStatus = 'pending' | 'accepted' | 'rejected';

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
