"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import {
  CreateSubmissionPayload,
  SubmissionQueryParams,
  UpdateSubmissionStatusPayload,
  User,
} from "@/types/api"

export const SUBMISSION_KEYS = {
  all: ["submissions"] as const,
  my: (studentId?: string) => ["submissions", "my", studentId] as const,
  mentorList: (params: SubmissionQueryParams) => ["mentor", "submissions", params] as const,
  mentorStats: () => ["mentor", "stats"] as const,
}

export function useMySubmissions(studentId?: string) {
  return useQuery({
    queryKey: SUBMISSION_KEYS.my(studentId),
    queryFn: () => api.submissions.getMySubmissions(studentId),
    enabled: !!studentId,
  })
}

export function useCreateSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payload,
      currentUser,
    }: {
      payload: CreateSubmissionPayload
      currentUser: User
    }) => api.submissions.create(payload, currentUser),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: SUBMISSION_KEYS.my(variables.currentUser.id),
      })
      queryClient.invalidateQueries({
        queryKey: ["mentor"],
      })
    },
  })
}

export function useMentorSubmissions(params: SubmissionQueryParams) {
  return useQuery({
    queryKey: SUBMISSION_KEYS.mentorList(params),
    queryFn: () => api.submissions.getAll(params),
  })
}

export function useMentorStats() {
  return useQuery({
    queryKey: SUBMISSION_KEYS.mentorStats(),
    queryFn: () => api.submissions.getStats(),
  })
}

export function useUpdateSubmissionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
      mentorName,
    }: {
      id: string
      payload: UpdateSubmissionStatusPayload
      mentorName?: string
    }) => api.submissions.updateStatus(id, payload, mentorName),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mentor"],
      })
      queryClient.invalidateQueries({
        queryKey: SUBMISSION_KEYS.all,
      })
    },
  })
}

