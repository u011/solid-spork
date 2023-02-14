import { register } from 'prom-client';
import express, { Request, Response } from 'express';

const app = express();

app.get('/', async (req: Request, res: Response) => {
  try {
    res.redirect(307, '/metrics');
  } catch (ex) {
    res.status(500).end(ex);
  }
})

// Expose metrics for prometheus to scrape
app.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
})

export default function exposeMetrics(port: number) {
  app.listen(port, function () {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  })
}
