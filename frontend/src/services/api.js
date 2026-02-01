const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * API Service for Customer Incident Radar
 */
class APIService {
  /**
   * Process a custom incident
   * @param {Object} incident - Event record data
   * @returns {Promise<Object>} Clean demo card
   */
  async processIncident(incident) {
    const response = await fetch(`${API_BASE_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incident),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Process a specific event by ID
   * @param {string} eventId - Event ID from samples
   * @returns {Promise<Object>} Clean demo card
   */
  async processById(eventId) {
    const response = await fetch(`${API_BASE_URL}/process/${eventId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Process multiple incidents individually
   * @param {number} limit - Number of events to process
   * @returns {Promise<Array>} Array of clean demo cards
   */
  async processBatch(limit = 5) {
    const response = await fetch(`${API_BASE_URL}/process/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Process multiple incidents collectively with pattern detection
   * @param {number} limit - Number of events to process
   * @returns {Promise<Object>} Batch analysis with incidents and collective insights
   */
  async processBatchCollective(limit = 5) {
    const response = await fetch(`${API_BASE_URL}/process/batch/collective`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List available sample events
   * @returns {Promise<Array>} Array of sample event summaries
   */
  async listSamples() {
    const response = await fetch(`${API_BASE_URL}/samples`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Download and load AI models
   * @returns {Promise<Object>} Status response
   */
  async downloadModels() {
    const response = await fetch(`${API_BASE_URL}/models/download`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Build RAG indexes
   * @returns {Promise<Object>} Index counts
   */
  async buildIndexes() {
    const response = await fetch(`${API_BASE_URL}/indexes/build`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export default new APIService();
