import axios from 'axios'
import { IBlockchainService } from '../interfaces/IBlockchainService'

/**
 * Service class for interacting with Solana blockchain via Helius API
 * Follows Single Responsibility Principle of SOLID
 */
export class SolanaService implements IBlockchainService {
  private readonly apiKey: string
  private readonly rpcUrl: string
  private readonly SPL_TOKEN_PROGRAM_ID =
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  private readonly EXCLUDED_ADDRESSES = new Set([
    '11111111111111111111111111111111', // Burn address
    '1nc1nerator11111111111111111111111111111111', // Common program address
  ])

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${this.apiKey}`
  }
  /**
   * Gets token balances for a specific mint
   * @param mint Token mint address
   * @returns Array of accounts and amounts
   */
  async getTokenBalances(
    mint: string
  ): Promise<{ account: string; amount: string }[]> {
    return this.getAllTokenHolders(mint);
  }

  private async rpcRequest(method: string, params: any[]): Promise<any> {
    try {
      const response = await axios.post(
        this.rpcUrl,
        {
          jsonrpc: '2.0',
          id: 'helius-rpc',
          method,
          params,
        },
        { timeout: 30000 }
      ) // 30s timeout

      if (response.data.error) {
        throw new Error(`RPC Error: ${response.data.error.message}`)
      }
      return response.data.result
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Gets all token holders with pagination support
   * @param mint Token mint address
   * @param pageSize Number of accounts per request (default 1000)
   */
  private async getAllTokenHolders(
    mint: string,
    pageSize = 1000
  ): Promise<{ account: string; amount: string }[]> {
    let allHolders: { account: string; amount: string }[] = []
    let page = 0
    let hasMore = true

    while (hasMore) {
      try {
        const response = await this.rpcRequest('getProgramAccounts', [
          this.SPL_TOKEN_PROGRAM_ID,
          {
            encoding: 'jsonParsed',
            filters: [
              { dataSize: 165 },
              { memcmp: { offset: 0, bytes: mint } },
            ],
            withContext: true,
            page,
            limit: pageSize,
          },
        ])

        if (!response?.value?.length) {
          hasMore = false
          break
        }

        const holders = response.value
          .filter(
            (acc: any) =>
              !this.EXCLUDED_ADDRESSES.has(
                acc.account.data.parsed.info.owner
              ) && acc.account.data.parsed.info.tokenAmount.amount !== '0'
          )
          .map((acc: any) => ({
            account: acc.account.data.parsed.info.owner,
            amount: acc.account.data.parsed.info.tokenAmount.amount,
          }))

        allHolders = [...allHolders, ...holders]

        // Check if we got fewer results than requested
        if (holders.length < pageSize) {
          hasMore = false
        } else {
          page++
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error)
        hasMore = false // Fail gracefully
      }
    }

    return allHolders
  }

  /**
   * Optimized HHI calculation with BigInt for precision
   */
  async calculateHHI(mint: string): Promise<{
    hhi: number
    totalSupply: string
    holderCount: number
    topHolders: Array<{ account: string; amount: string; percentage: number }>
    concentrationLevel: string
  }> {
    try {
      // Step 1: Fetch all holders with pagination
      const holders = await this.getAllTokenHolders(mint)

      if (holders.length === 0) {
        return this.emptyResult()
      }

      // Step 2: Calculate total supply from active holders
      const totalSupply = holders.reduce(
        (sum, holder) => sum + BigInt(holder.amount),
        BigInt(0)
      )

      if (totalSupply === BigInt(0)) {
        return this.emptyResult()
      }

      // Step 3: Calculate HHI using precise integer math
      let hhiSum = BigInt(0)
      const holdersWithPercentage = holders.map((holder) => {
        const amount = BigInt(holder.amount)
        // Calculate percentage with 4 decimal places of precision
        const percentage =
          Number((amount * BigInt(1000000)) / totalSupply) / 10000

        // For HHI: (amount/totalSupply)^2 * 10000 (scaled to integer)
        const squared =
          (amount * amount * BigInt(10000)) / (totalSupply * totalSupply)
        hhiSum += squared

        return {
          account: holder.account,
          amount: holder.amount,
          percentage,
        }
      })

      // Final HHI value (already scaled to 0-10,000 range)
      const hhi = Number(hhiSum)

      // Step 4: Analyze concentration
      const sortedHolders = holdersWithPercentage.sort(
        (a, b) => b.percentage - a.percentage
      )
      const concentrationLevel = this.getConcentrationLevel(hhi)

      return {
        hhi,
        totalSupply: totalSupply.toString(),
        holderCount: holders.length,
        topHolders: sortedHolders.slice(0, 10),
        concentrationLevel,
      }
    } catch (error) {
      console.error('HHI Calculation Error:', error)
      throw new Error(
        `HHI calculation failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  private emptyResult() {
    return {
      hhi: 0,
      totalSupply: '0',
      holderCount: 0,
      topHolders: [],
      concentrationLevel: 'No active holders',
    }
  }

  private getConcentrationLevel(hhi: number): string {
    if (hhi >= 5000) return 'Extreme concentration (risk of manipulation)'
    if (hhi >= 2500) return 'High concentration'
    if (hhi >= 1500) return 'Moderate concentration'
    return 'Decentralized'
  }
}
