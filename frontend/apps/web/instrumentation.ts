export async function register() {
  // No-op
}

export const onRequestError = async (
  _err: unknown,
  _request: { headers?: { cookie?: string | string[] } },
  _context: unknown,
) => {
  // No-op: client-side errors are logged via console.error in the error boundaries.
};
