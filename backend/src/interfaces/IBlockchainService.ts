/**
 * Interface defining the contract for blockchain services
 * Following Interface Segregation Principle of SOLID
 */
export interface IBlockchainService {
  /**
   * Gets token holder balances for a specific token
   * @param mint The token mint address
   * @returns Promise containing an array of holder accounts and their balances
   */
  getTokenBalances(mint: string): Promise<{ account: string; amount: string }[]>;
  
  /**
   * Calculates the Herfindahl-Hirschman Index (HHI) for a token
   * @param mint The token mint address
   * @returns Promise containing the HHI value and related data
   */
  calculateHHI(mint: string): Promise<{
    hhi: number;
    totalSupply: string;
    holderCount: number;
    topHolders: Array<{
      account: string;
      amount: string;
      percentage: number;
    }>;
    concentrationLevel: string;
  }>;
}