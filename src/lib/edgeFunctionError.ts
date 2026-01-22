import { FunctionsHttpError } from '@supabase/supabase-js';

export interface EdgeFunctionErrorData {
  error?: string;
  locked?: boolean;
  remainingMinutes?: number;
  attemptsRemaining?: number;
  [key: string]: unknown;
}

/**
 * Parses error response from Supabase Edge Functions.
 * When Edge Function returns non-2xx status, data is null and the response is in error.context
 */
export async function parseEdgeFunctionError(
  error: Error | null,
  data: EdgeFunctionErrorData | null
): Promise<EdgeFunctionErrorData | null> {
  // If data has an error, return it directly
  if (data?.error) {
    return data;
  }

  // If no error object, nothing to parse
  if (!error) {
    return null;
  }

  // Try to parse FunctionsHttpError context
  if (error instanceof FunctionsHttpError && error.context) {
    try {
      const errorBody = await error.context.json();
      return errorBody as EdgeFunctionErrorData;
    } catch {
      // Could not parse JSON from context
    }
  }

  // Fallback: try to extract JSON from error message
  // Some SDK versions put the response in the message like "Edge function returned 400: {...}"
  const message = error.message || '';
  const jsonMatch = message.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as EdgeFunctionErrorData;
    } catch {
      // Could not parse JSON from message
    }
  }

  return null;
}

/**
 * Gets a user-friendly error message from Edge Function response
 */
export function getErrorMessage(
  errorData: EdgeFunctionErrorData | null,
  fallbackMessage: string
): string {
  if (errorData?.error) {
    return errorData.error;
  }
  return fallbackMessage;
}
