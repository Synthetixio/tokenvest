import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  GrantCancelled,
  GrantCreated,
  OwnerNomination,
  OwnerUpdate,
  Redemption,
  Supply,
  Transfer,
  Withdrawal
} from "../generated/Vester/Vester"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createGrantCancelledEvent(tokenId: BigInt): GrantCancelled {
  let grantCancelledEvent = changetype<GrantCancelled>(newMockEvent())

  grantCancelledEvent.parameters = new Array()

  grantCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return grantCancelledEvent
}

export function createGrantCreatedEvent(tokenId: BigInt): GrantCreated {
  let grantCreatedEvent = changetype<GrantCreated>(newMockEvent())

  grantCreatedEvent.parameters = new Array()

  grantCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return grantCreatedEvent
}

export function createOwnerNominationEvent(newOwner: Address): OwnerNomination {
  let ownerNominationEvent = changetype<OwnerNomination>(newMockEvent())

  ownerNominationEvent.parameters = new Array()

  ownerNominationEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerNominationEvent
}

export function createOwnerUpdateEvent(
  oldOwner: Address,
  newOwner: Address
): OwnerUpdate {
  let ownerUpdateEvent = changetype<OwnerUpdate>(newMockEvent())

  ownerUpdateEvent.parameters = new Array()

  ownerUpdateEvent.parameters.push(
    new ethereum.EventParam("oldOwner", ethereum.Value.fromAddress(oldOwner))
  )
  ownerUpdateEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerUpdateEvent
}

export function createRedemptionEvent(
  tokenId: BigInt,
  redeemerAddress: Address,
  amount: BigInt
): Redemption {
  let redemptionEvent = changetype<Redemption>(newMockEvent())

  redemptionEvent.parameters = new Array()

  redemptionEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  redemptionEvent.parameters.push(
    new ethereum.EventParam(
      "redeemerAddress",
      ethereum.Value.fromAddress(redeemerAddress)
    )
  )
  redemptionEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return redemptionEvent
}

export function createSupplyEvent(
  supplierAddress: Address,
  tokenAddress: Address,
  amount: BigInt
): Supply {
  let supplyEvent = changetype<Supply>(newMockEvent())

  supplyEvent.parameters = new Array()

  supplyEvent.parameters.push(
    new ethereum.EventParam(
      "supplierAddress",
      ethereum.Value.fromAddress(supplierAddress)
    )
  )
  supplyEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAddress",
      ethereum.Value.fromAddress(tokenAddress)
    )
  )
  supplyEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return supplyEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}

export function createWithdrawalEvent(
  withdrawerAddress: Address,
  withdrawalTokenAddress: Address,
  amount: BigInt
): Withdrawal {
  let withdrawalEvent = changetype<Withdrawal>(newMockEvent())

  withdrawalEvent.parameters = new Array()

  withdrawalEvent.parameters.push(
    new ethereum.EventParam(
      "withdrawerAddress",
      ethereum.Value.fromAddress(withdrawerAddress)
    )
  )
  withdrawalEvent.parameters.push(
    new ethereum.EventParam(
      "withdrawalTokenAddress",
      ethereum.Value.fromAddress(withdrawalTokenAddress)
    )
  )
  withdrawalEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawalEvent
}
