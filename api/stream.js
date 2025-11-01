export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send("URL parametresi eksik.");
  }

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Hedef bağlantı açılmadı: ${response.status}`);
    }

    res.setHeader("Content-Type", response.headers.get("content-type") || "video/mp2t");
    const reader = response.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    return new Response(stream).body.pipeTo(res);
  } catch (err) {
    res.status(500).send("Proxy hatası: " + err.message);
  }
}
