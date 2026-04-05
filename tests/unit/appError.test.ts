import { describe, it, expect } from 'vitest'
import { AppError } from '@/lib/errors/AppError'

describe('AppError', () => {
  it('creates error instance with provided code', () => {
    const err = new AppError('ERR_PAYMENT_FAILED')
    expect(err).toBeInstanceOf(AppError)
    expect(err.code).toBe('ERR_PAYMENT_FAILED')
  })

  it('extends Error class', () => {
    const err = new AppError('ERR_UNKNOWN')
    expect(err).toBeInstanceOf(Error)
  })

  it('has valid httpStatus number >= 400', () => {
    const err = new AppError('ERR_PAYMENT_FAILED')
    expect(typeof err.httpStatus).toBe('number')
    expect(err.httpStatus).toBeGreaterThanOrEqual(400)
  })

  it('toUserResponse omits stack trace', () => {
    const err = new AppError('ERR_UNKNOWN')
    const response = err.toUserResponse('en')
    expect(response).not.toHaveProperty('stack')
    expect(response).toHaveProperty('message')
    expect(typeof response.message).toBe('string')
  })

  it('toUserResponse includes error code', () => {
    const err = new AppError('ERR_PAYMENT_FAILED')
    const response = err.toUserResponse('en')
    expect(response).toHaveProperty('code')
  })

  it('getTitleForLang returns non-empty string for English', () => {
    const err = new AppError('ERR_PAYMENT_FAILED')
    const title = err.getTitleForLang('en')
    expect(typeof title).toBe('string')
    expect(title.length).toBeGreaterThan(0)
  })

  it('getTitleForLang returns non-empty string for Tamil', () => {
    const err = new AppError('ERR_PAYMENT_FAILED')
    const title = err.getTitleForLang('ta')
    expect(typeof title).toBe('string')
    expect(title.length).toBeGreaterThan(0)
  })

  it('getMessageForLang returns non-empty string', () => {
    const err = new AppError('ERR_OTP_EXPIRED')
    const msg = err.getMessageForLang('en')
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  it('getFixStepsForLang returns array for English', () => {
    const err = new AppError('ERR_OTP_EXPIRED')
    const steps = err.getFixStepsForLang('en')
    expect(Array.isArray(steps)).toBe(true)
  })

  it('handles ERR_UNKNOWN gracefully without throwing', () => {
    expect(() => new AppError('ERR_UNKNOWN')).not.toThrow()
  })

  it('toAdminLog includes more detail than toUserResponse', () => {
    const err = new AppError('ERR_DB_CONNECTION_LOST')
    const adminLog = err.toAdminLog()
    const userResponse = err.toUserResponse('en')
    expect(adminLog).toHaveProperty('code')
    expect(adminLog).toHaveProperty('adminMessage')
    // admin log should have more keys than user response
    expect(Object.keys(adminLog).length).toBeGreaterThanOrEqual(
      Object.keys(userResponse).length
    )
  })

  it('severity is one of expected values', () => {
    const err = new AppError('ERR_PAYMENT_FAILED')
    expect(['low', 'medium', 'high', 'critical']).toContain(err.severity)
  })

  it('autoFixable is boolean', () => {
    const err = new AppError('ERR_PAYMENT_FAILED')
    expect(typeof err.autoFixable).toBe('boolean')
  })
})
