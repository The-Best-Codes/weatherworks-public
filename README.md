# Next.js Weather Dashboard

This project is a Next.js-based weather dashboard application that provides various weather-related information and forecasts.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Weather forecasts
- Indoor sensor data
- Custom news feed
- Moon phase information
- UV index stats
- Rain statistics
- Wind information
- Weather alerts

## Technologies Used

- Next.js 13+
- React
- TypeScript
- Tailwind CSS
- Radix UI components

## Project Structure

The main application is built around a central [Compile](cci:2:///home/dell/Coding/WeatherWorks-Versions/weatherworks/components/Compile.tsx:20:0-28:1) component, which is rendered in [app/page.tsx](cci:7:///home/dell/Coding/WeatherWorks-Versions/weatherworks/app/page.tsx:0:0-0:0). The project uses various custom components located in the `components` directory.

## Customization

The project includes multiple themes and customizable units for temperature, speed, pressure, and length measurements.

## API

The application fetches data from various API endpoints, including:

- `/api/swd_mirror/forecast`
- `/api/modules/indoor/latest`
- `/api/news/main`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.