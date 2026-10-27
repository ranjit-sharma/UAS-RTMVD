# UAS-RTMVD — Data Format

## Observation Object

A single atmospheric sounding observation is represented as follows.

### JSON Schema

```json
{
  "id": "string (MongoDB ObjectId)",
  "altitude": "number — meters above sea level (0–50000)",
  "temperature": "number — degrees Celsius (-100 to 60)",
  "pressure": "number — hectopascals, hPa (1 to 1100)",
  "humidity": "number — relative humidity, percent (0–100)",
  "windSpeed": "number — meters per second (0–200)",
  "windDirection": "number — degrees from north (0–360)",
  "recordedAt": "string — ISO 8601 UTC datetime",
  "source": "string — 'simulated' | 'instrument' | 'manual'",
  "sessionId": "string | null — ID of the DataCollection session",
  "createdBy": "string — ID of the user who created the record",
  "createdAt": "string — ISO 8601 UTC datetime",
  "updatedAt": "string — ISO 8601 UTC datetime"
}
```

### Field Constraints

| Field | Type | Range | Unit | Notes |
|-------|------|-------|------|-------|
| altitude | float | 0 – 50,000 | meters | Required |
| temperature | float | -100 – 60 | °C | Required |
| pressure | float | 1 – 1,100 | hPa | Required |
| humidity | float | 0 – 100 | % RH | Required |
| windSpeed | float | 0 – 200 | m/s | Required |
| windDirection | float | 0 – 360 | degrees | Required, 0 = North |
| recordedAt | ISO 8601 | — | — | Required, must be valid date |
| source | enum | — | — | 'simulated', 'instrument', 'manual' |

---

## Simulated Data

The simulator generates plausible atmospheric profiles approximating a standard atmosphere. All simulated records have `source: "simulated"`.

### Simulation Parameters

The simulator uses a simplified International Standard Atmosphere (ISA) model:

- **Temperature lapse rate:** approximately −6.5°C per 1,000m in the troposphere
- **Pressure:** decreases exponentially with altitude
- **Humidity:** decreases with altitude, with random variation
- **Wind speed:** increases with altitude up to the jet stream level
- **Wind direction:** varies slowly over time

### Simulated Profile Example

```json
{
  "altitude": 5000,
  "temperature": -17.5,
  "pressure": 540.5,
  "humidity": 42.3,
  "windSpeed": 18.2,
  "windDirection": 245.7,
  "recordedAt": "2026-09-29T12:00:00.000Z",
  "source": "simulated"
}
```

---

## Hardware Integration Interface

To connect real UAS hardware (e.g., RS41 or RS92 radiosonde ground station), implement the `IDataSource` interface:

```js
/**
 * IDataSource — Data source interface for UAS hardware adapters.
 * Implement this class to integrate a real instrument.
 */
class IDataSource {
  /**
   * Start reading observations.
   * @param {string} sessionId - The active collection session ID.
   * @param {function(ObservationPayload): void} onObservation - Called for each observation.
   * @param {function(Error): void} onError - Called on non-fatal errors.
   */
  start(sessionId, onObservation, onError) {
    throw new Error('Not implemented');
  }

  /**
   * Stop reading observations and release all resources.
   */
  stop() {
    throw new Error('Not implemented');
  }

  /**
   * Returns a short identifier for this data source.
   * @returns {string} e.g. 'rs41-serial', 'tcp-socket', 'file-replay'
   */
  getSourceName() {
    throw new Error('Not implemented');
  }
}
```

### ObservationPayload

```js
{
  altitude: number,      // meters
  temperature: number,   // °C
  pressure: number,      // hPa
  humidity: number,      // %
  windSpeed: number,     // m/s
  windDirection: number, // degrees
  recordedAt: Date,
}
```

The `DataCollectionService` will validate this payload against the Observation Zod schema before saving it. Invalid payloads are logged and discarded — they do not stop the session.

---

## CSV Export Format

Exported CSV files use the following column order:

```
id,altitude,temperature,pressure,humidity,windSpeed,windDirection,recordedAt,source,sessionId
```

All numeric values are exported with full precision. Dates are in ISO 8601 format. The first row is a header row.
