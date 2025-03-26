import { Request, Response } from 'express';
import { IBlockchainService } from '../interfaces/IBlockchainService';

/**
 * Controller for HHI-related endpoints
 * Follows Dependency Inversion Principle of SOLID
 */
export class HhiController {
  private blockchainService: IBlockchainService;

  /**
   * Constructor for HhiController
   * @param blockchainService Injected blockchain service
   */
  constructor(blockchainService: IBlockchainService) {
    this.blockchainService = blockchainService;
  }

  /**
   * Gets HHI for a token mint
   * @param req Express request
   * @param res Express response
   */
  async getHHI(req: Request, res: Response): Promise<void> {
    const { mint } = req.query;

    if (!mint || typeof mint !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid or missing token mint address'
      });
      return;
    }

    try {
      // Validate the mint address format (Solana addresses are base58 encoded)
      if (!this.isValidSolanaAddress(mint)) {
        res.status(400).json({
          success: false,
          message: 'Invalid Solana token mint address format'
        });
        return;
      }

      const result = await this.blockchainService.calculateHHI(mint);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error calculating HHI:', error);
      
      // Provide more helpful error messages based on the error type
      let errorMessage = 'Failed to calculate HHI';
      if (error instanceof Error) {
        if (error.message.includes('Invalid token') || error.message.includes('not found')) {
          errorMessage = 'The specified token mint address was not found or is invalid';
        } else if (error.message.includes('API Error')) {
          errorMessage = 'Error connecting to Solana RPC service';
        } else {
          errorMessage = error.message;
        }
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Basic validation for Solana address format
   * @param address The address to validate
   * @returns Whether the address is valid
   */
  private isValidSolanaAddress(address: string): boolean {
    // Solana addresses are base58 encoded and usually around 32-44 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  }
}