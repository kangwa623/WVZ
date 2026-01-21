// Gemini API Keys
const AUDIT_API_KEY = 'AIzaSyCAyyDOPrQQ79nid-W2D_zn4j7RsUMiIlI';
const EPR_API_KEY = 'AIzaSyC1DTBzEd27b-bV6hpaRftmasTa2Fs92Es';
const BASE_MODEL = 'gemini-2.5-flash-preview-09-2025';

export interface FinancialData {
  totalOperationalCost: number;
  totalFuelCost: number;
  totalDistance: number;
  costPerKm: number;
  costCenterBreakdown: Array<{
    center: string;
    cost: number;
    km: number;
    color: string;
  }>;
  monthlyFuelConsumption: Array<{
    month: string;
    consumption: number;
    cost: number;
  }>;
}

class FinanceReportService {
  /**
   * Fetch with exponential backoff retry
   */
  private async fetchWithBackoff(
    url: string,
    options: any,
    maxRetries: number = 5
  ): Promise<Response> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`Attempt ${i + 1} failed with status: ${response.status}`, errorBody);
          if (response.status === 429 || response.status >= 500) {
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          } else {
            throw new Error(`API failed with status ${response.status}: ${errorBody.substring(0, 200)}...`);
          }
        }
        return response;
      } catch (error: any) {
        console.error('Fetch error:', error);
        if (i === maxRetries - 1) throw error;
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Get financial data prompt string
   */
  getFinancialDataPrompt(data: FinancialData): string {
    return `
FINANCIAL SUMMARY DATA (For context and inclusion in report):
Total Operational Cost: ${data.totalOperationalCost.toFixed(2)} ZMW
Total Fuel Cost: ${data.totalFuelCost.toFixed(2)} ZMW
Total Distance: ${data.totalDistance.toLocaleString()} KM
Cost Per KM: ${data.costPerKm.toFixed(2)} ZMW/KM

COST CENTER BREAKDOWN (Cost, KM):
${data.costCenterBreakdown.map(c => `- ${c.center}: ${c.cost.toFixed(2)} ZMW / ${c.km.toLocaleString()} KM`).join('\n')}

FUEL CONSUMPTION TREND (LITERS & COST - JAN TO JUN):
${data.monthlyFuelConsumption.map(m => `- ${m.month}: ${m.consumption} Liters (Cost: ${m.cost.toFixed(2)} ZMW)`).join('\n')}
    `;
  }

  /**
   * Generate Audit Report
   */
  async generateAuditReport(data: FinancialData): Promise<string> {
    const financeDataPrompt = this.getFinancialDataPrompt(data);
    
    const prompt = `
Act as a Certified Public Accountant specializing in non-profit fleet management.
Generate a "Financial Reconciliation and Audit Summary" report based on the provided data. 

The report must analyze the following:
1. Reconciliation of Total Operational Cost vs. Cost Center breakdown.
2. Analysis of the Cost per KM metric against the Total Distance.
3. Detailed variance analysis for the Monthly Fuel Consumption and associated costs, highlighting any anomalies or potential areas of fraud/waste.
4. A concluding summary of financial health and reconciliation recommendations.

Structure the output strictly as a plaintext document using capitalized headings and double line breaks. Do not use markdown, bullets, or numbering, only plain text.

---

REPORT TITLE: Q2 2025 FLEET FINANCIAL AUDIT SUMMARY

${financeDataPrompt}
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${BASE_MODEL}:generateContent?key=${AUDIT_API_KEY}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await this.fetchWithBackoff(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Failed to generate audit report');
    }
  }

  /**
   * Generate EPR (Integrated Performance & Resource Report)
   */
  async generateEPRReport(
    data: FinancialData,
    name: string,
    rank: string,
    period: string,
    achievements: string,
    weaknesses: string
  ): Promise<string> {
    if (!name || !rank || !achievements) {
      throw new Error('Name, rank, and achievements are required');
    }

    const financeDataPrompt = this.getFinancialDataPrompt(data);
    
    const prompt = `
Act as a professional military performance evaluator and financial liaison. 
Write a single, comprehensive "Performance and Resource Management Report" for the individual below.
The report must seamlessly integrate the EPR narrative with the provided financial data, specifically citing cost center and fuel efficiency trends.

Structure the output strictly as a plaintext document using capitalized headings and double line breaks. Do not use markdown, bullets, or numbering, only plain text.

---

REPORT TITLE: Performance and Resource Management Report

MEMBER DETAILS:
NAME: ${name}
RANK: ${rank}
REPORTING PERIOD: ${period || 'Current Evaluation Cycle'}

SECTION 1: FINANCIAL RESOURCE OVERSIGHT
(Use the Financial Summary Data and Breakdown provided below to create a narrative paragraph summarizing performance related to cost, distance, and fuel use. Highlight any relevant cost efficiency implied by the member's achievements.)

SECTION 2: MEMBER KEY ACHIEVEMENTS
(Transform the provided achievements into formal, impactful military narrative paragraphs.)

SECTION 3: AREAS FOR DEVELOPMENT
(Address the improvement points professionally and suggest growth.)

---

RAW INPUT DATA:

ACHIEVEMENTS:
${achievements}

AREAS FOR IMPROVEMENT:
${weaknesses || 'N/A'}

${financeDataPrompt}
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${BASE_MODEL}:generateContent?key=${EPR_API_KEY}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await this.fetchWithBackoff(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Failed to generate EPR report');
    }
  }
}

export const financeReportService = new FinanceReportService();
export default financeReportService;
