const POST = async ({ request }) => {
  try {
    const { state } = await request.json();
    return new Response(
      JSON.stringify({
        success: true,
        state,
        message: "Watering control simulated (GPIO control will be implemented on Raspberry Pi)"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

export { POST };
//# sourceMappingURL=_server.ts-uF_sPlOA.js.map
