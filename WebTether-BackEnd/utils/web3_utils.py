# import os
# from dotenv import load_dotenv
# from web3 import Web3

# # Load environment variables
# load_dotenv()

# # RPC endpoint (e.g. Infura/Alchemy)
# WEB3_RPC_URL = os.getenv("WEB3_RPC_URL")
# if not WEB3_RPC_URL:
#     raise RuntimeError("WEB3_RPC_URL is not set in .env")

# # Initialize Web3 provider
# w3 = Web3(Web3.HTTPProvider(WEB3_RPC_URL))
# if not w3.is_connected():
#     raise RuntimeError(f"Failed to connect to Ethereum RPC at {WEB3_RPC_URL}")

# # ERC-20 token used for payments (USDC on Ethereum Mainnet)
# USDC_ADDRESS = w3.to_checksum_address(os.getenv("PAYMENT_TOKEN_ADDRESS"))
# if not USDC_ADDRESS:
#     raise RuntimeError("PAYMENT_TOKEN_ADDRESS is not set in .env")

# # Your platform’s treasury wallet (receives user fees)
# PLATFORM_ADDR = w3.to_checksum_address(os.getenv("PLATFORM_TREASURY_ADDRESS"))
# if not PLATFORM_ADDR:
#     raise RuntimeError("PLATFORM_TREASURY_ADDRESS is not set in .env")

# # ERC-20 Transfer event signature topic
# TRANSFER_TOPIC = w3.keccak(text="Transfer(address,address,uint256)").hex()

# # Minimal ABI to decode Transfer events
# ERC20_ABI = [
#     {
#         "anonymous": False,
#         "inputs": [
#             {"indexed": True, "internalType": "address", "name": "from", "type": "address"},
#             {"indexed": True, "internalType": "address", "name": "to",   "type": "address"},
#             {"indexed": False,"internalType": "uint256","name": "value","type": "uint256"}
#         ],
#         "name": "Transfer",
#         "type": "event"
#     }
# ]

# # Create a contract object for USDC
# token_contract = w3.eth.contract(address=USDC_ADDRESS, abi=ERC20_ABI)


# def verify_usdc_payment(tx_hash: str, user_addr: str, required_amount: int) -> bool:
#     """
#     Verifies that the given transaction hash includes a Transfer event
#     of at least `required_amount` USDC (6 decimals) from `user_addr`
#     to the platform treasury address.

#     :param tx_hash:      The transaction hash to inspect.
#     :param user_addr:    The user's wallet address (checks `from` field).
#     :param required_amount: The minimum token units (integer with 6 decimals).
#     :return:             True if a valid Transfer(log) is found, else False.
#     """
#     try:
#         receipt = w3.eth.get_transaction_receipt(tx_hash)
#     except Exception as e:
#         # Could not fetch receipt
#         return False

#     for log in receipt.logs:
#         # Check it's a USDC Transfer event
#         if log.address.lower() == USDC_ADDRESS.lower() and log.topics[0].hex() == TRANSFER_TOPIC:
#             try:
#                 evt = token_contract.events.Transfer().processLog(log)
#             except Exception:
#                 continue

#             frm = evt["args"]["from"]
#             to  = evt["args"]["to"]
#             val = evt["args"]["value"]

#             if (
#                 frm.lower() == user_addr.lower() and
#                 to.lower()  == PLATFORM_ADDR.lower() and
#                 val >= required_amount
#             ):
#                 return True

#     return False
