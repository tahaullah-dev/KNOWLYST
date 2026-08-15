// client/src/services/api.ts
import { AssessmentRequest, AssessmentResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function generateAssessment(request: AssessmentRequest): Promise<AssessmentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/assessment/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        response.status,
        errorData?.message || `Request failed with status ${response.status}`,
        errorData,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, 'Network error. Please check your connection and try again.');
    }
    
    throw new ApiError(500, 'Failed to generate assessment. Please try again.');
  }
}