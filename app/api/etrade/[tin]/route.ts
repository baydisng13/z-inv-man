import { NextResponse } from "next/server";
import axios from "axios";



// curl 'https://etrade.gov.et/api/Registration/GetRegistrationInfoByTin/0000030603/en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'Accept-Language: en-US,en;q=0.9' \
//   -H 'Connection: keep-alive' \
//   -H 'Referer: https://etrade.gov.et/business-license-checker?tin=0000030603' \
//   -H 'Sec-Fetch-Dest: empty' \
//   -H 'Sec-Fetch-Mode: cors' \
//   -H 'Sec-Fetch-Site: same-origin' \
//   -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0' \
//   -H 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'sec-ch-ua-platform: "Windows"'

/**
 * Next.js API route handler for GET requests.
 * Fetches business registration information from the eTrade API based on a TIN.
 * Expects a dynamic 'tin' parameter in the URL (e.g., /api/etrade/[tin]).
 */
export async function GET(
  req: Request,
  // The context object contains the params. For some Next.js versions/configs,
  // this params object is a promise that must be awaited.
  context: { params: Promise<{ tin: string }> }
) {
  // Awaiting context.params to resolve the promise, as suggested by the error message.
  
  const { tin } = await context.params;

  // Base configuration for the external API request.
  if (!tin) {
    return NextResponse.json(
      { message: "TIN parameter is missing." },
      { status: 400 }
    );
  }

  try {
    const url = `https://etrade.gov.et/api/Registration/GetRegistrationInfoByTin/${tin}/en`;
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
        Referer: "https://etrade.gov.et/business-license-checker?tin=0000030603",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0",
        "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    });

    // The external API returns a 204 No Content status with an empty body ('')
    // when a TIN is not found. This check correctly handles that case.
    if (!response.data || Object.keys(response.data).length === 0) {
      return NextResponse.json(
        { message: `No registration information found for TIN: ${tin}` },
        { status: 404 }
      );
    }

    // On success, return the fetched data with a 200 OK status.
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error in GET handler for TIN ${tin}:`, error.message);

    // Specifically handle timeout errors
    if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      return NextResponse.json(
        { message: `The request to the external eTrade API timed out.` },
        { status: 504 } // 504 Gateway Timeout
      );
    }

    // Handle other Axios-specific errors
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          message: "An error occurred while fetching data from the eTrade API.",
          error:
            error.response?.data ||
            "No additional error information available.",
        },
        { status: error.response?.status || 500 }
      );
    }

    // For any other type of error, return a generic 500 Internal Server Error.
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
