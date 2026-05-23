import { useState } from 'react';

// Custom SVG building logo matching Notion "Upgrade to Plus" design
const NotionPlusLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 12 }}>
    {/* Left dome building */}
    <path d="M6 24 C6 20 9 18 13 18 C17 18 20 20 20 24 L20 40 L6 40 Z" fill="#1F2733"/>
    <rect x="9" y="26" width="3" height="4" rx="1" fill="#FFF" opacity="0.35"/>
    <rect x="14" y="26" width="3" height="4" rx="1" fill="#FFF" opacity="0.35"/>
    <rect x="9" y="32" width="3" height="4" rx="1" fill="#FFF" opacity="0.35"/>
    <rect x="14" y="32" width="3" height="4" rx="1" fill="#FFF" opacity="0.35"/>

    {/* Right peaked building */}
    <path d="M22 16 L33 6 L44 16 L44 40 L22 40 Z" fill="#1F2733"/>
    <rect x="26" y="18" width="4" height="5" rx="1" fill="#FFF" opacity="0.35"/>
    <rect x="34" y="18" width="4" height="5" rx="1" fill="#FFF" opacity="0.35"/>
    <rect x="26" y="26" width="4" height="5" rx="1" fill="#FFF" opacity="0.35"/>
    <rect x="34" y="26" width="4" height="5" rx="1" fill="#FFF" opacity="0.35"/>
    <rect x="26" y="33" width="4" height="5" rx="1" fill="#FFF" opacity="0.35"/>
    <rect x="34" y="33" width="4" height="5" rx="1" fill="#FFF" opacity="0.35"/>

    {/* Rising curved arrow */}
    <path d="M10 32 C12 24 18 14 30 11" stroke="#1F2733" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M25 8 L32 10 L30 17" fill="#1F2733"/>
  </svg>
);

export default function PremiumModal({ onClose }) {
  const [billingOption, setBillingOption] = useState('monthly'); // 'monthly' | 'annual'
  const [addonChecked, setAddonChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'bank'
  const [focusedField, setFocusedField] = useState(null);

  const [form, setForm] = useState({
    name: 'HGU',
    business: '',
    card: '',
    exp: '',
    cvc: '',
    country: 'United States',
    zip: ''
  });

  const handleInputChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Notion Price Calculations
  const basePrice = billingOption === 'monthly' ? 10 : 8;
  const addonPrice = addonChecked ? 10 : 0;
  const totalPrice = basePrice + addonPrice;

  // Custom styling helper for Notion-style inputs with focus states
  const getInputStyle = (fieldName) => ({
    width: '100%',
    height: '34px',
    boxSizing: 'border-box',
    padding: '6px 12px',
    fontSize: '14px',
    color: '#37352f',
    background: focusedField === fieldName ? '#fff' : '#f7f7f5',
    border: focusedField === fieldName ? '1px solid #2383e2' : '1px solid #e3e2e0',
    boxShadow: focusedField === fieldName ? '0 0 0 2px rgba(35, 131, 226, 0.2)' : 'none',
    borderRadius: '5px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease'
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 15, 15, 0.6)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          color: '#37352f',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: 'rgba(55, 53, 47, 0.65)',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(55, 53, 47, 0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          ×
        </button>

        {/* Header Block */}
        <div style={{ padding: '36px 40px 0' }}>
          <NotionPlusLogo />
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em' }}>
            Upgrade to Plus
          </h2>
          <p style={{ margin: 0, fontSize: '14.5px', color: 'rgba(55, 53, 47, 0.65)', lineHeight: 1.4 }}>
            Do more with unlimited blocks, files, automations & integrations.
          </p>
        </div>

        {/* Two Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', padding: '24px 40px 36px' }}>

          {/* Left Column: Billed to & Payment details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Billed to */}
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#5f5e5b', marginBottom: '8px' }}>
                Billed to
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleInputChange('name')}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputStyle('name')}
                />
                <input
                  type="text"
                  placeholder="Business name (optional)"
                  value={form.business}
                  onChange={handleInputChange('business')}
                  onFocus={() => setFocusedField('business')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputStyle('business')}
                />
              </div>
            </div>

            {/* Payment details */}
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#5f5e5b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Payment details
                <svg width="11" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(55, 53, 47, 0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>

              {/* Tabs card/bank */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => setActiveTab('card')}
                  style={{
                    flex: 1,
                    height: '34px',
                    border: activeTab === 'card' ? '1px solid #2383e2' : '1px solid #e3e2e0',
                    background: '#fff',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    fontWeight: activeTab === 'card' ? '600' : '400',
                    color: '#37352f',
                    transition: 'border 0.15s ease'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'card' ? '#2383e2' : 'rgba(55, 53, 47, 0.65)'} strokeWidth="2.5">
                    <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  Card
                </button>
                <button
                  onClick={() => setActiveTab('bank')}
                  style={{
                    flex: 1,
                    height: '34px',
                    border: activeTab === 'bank' ? '1px solid #2383e2' : '1px solid #e3e2e0',
                    background: '#fff',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    fontWeight: activeTab === 'bank' ? '600' : '400',
                    color: '#37352f',
                    transition: 'border 0.15s ease'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'bank' ? '#2383e2' : 'rgba(55, 53, 47, 0.65)'} strokeWidth="2.5">
                    <path d="M3 22h18M6 18V9M10 18V9M14 18V9M18 18V9M12 2L2 7v2h20V7L12 2z"/>
                  </svg>
                  Bank
                </button>
              </div>

              {activeTab === 'card' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Card number absolute-wrapper */}
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Card number"
                      value={form.card}
                      onChange={handleInputChange('card')}
                      onFocus={() => setFocusedField('card')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...getInputStyle('card'),
                        paddingRight: '120px'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      gap: '4px',
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      {['Visa', 'MC', 'Amex', 'Elo'].map(brand => (
                        <span key={brand} style={{
                          fontSize: '9px',
                          fontWeight: '700',
                          color: 'rgba(55, 53, 47, 0.4)',
                          border: '1.2px solid #e3e2e0',
                          padding: '1px 3px',
                          borderRadius: '3px',
                          background: '#fff'
                        }}>
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expiration + CVC */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Expiration"
                      value={form.exp}
                      onChange={handleInputChange('exp')}
                      onFocus={() => setFocusedField('exp')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyle('exp')}
                    />
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type="text"
                        placeholder="CVC"
                        value={form.cvc}
                        onChange={handleInputChange('cvc')}
                        onFocus={() => setFocusedField('cvc')}
                        onBlur={() => setFocusedField(null)}
                        style={{
                          ...getInputStyle('cvc'),
                          paddingRight: '34px'
                        }}
                      />
                      {/* small card/cvc logo */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(55, 53, 47, 0.4)"
                        strokeWidth="2.5"
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none'
                        }}
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
                        <circle cx="18" cy="12" r="1.5" fill="rgba(55, 53, 47, 0.6)"/>
                      </svg>
                    </div>
                  </div>

                  {/* Country dropdown */}
                  <div style={{ position: 'relative', width: '100%' }}>
                    <select
                      value={form.country}
                      onChange={handleInputChange('country')}
                      onFocus={() => setFocusedField('country')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...getInputStyle('country'),
                        appearance: 'none',
                        background: focusedField === 'country' ? '#fff' : '#f7f7f5',
                        cursor: 'pointer'
                      }}
                    >
                      <option>United States</option>
                      <option>South Korea</option>
                      <option>United Kingdom</option>
                      <option>Japan</option>
                    </select>
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}
                    >
                      <path d="M1 1L5 5L9 1" stroke="rgba(55, 53, 47, 0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* ZIP */}
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={form.zip}
                    onChange={handleInputChange('zip')}
                    onFocus={() => setFocusedField('zip')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyle('zip')}
                  />
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  background: '#f7f7f5',
                  borderRadius: '5px',
                  fontSize: '13px',
                  color: 'rgba(55, 53, 47, 0.6)',
                  textAlign: 'center',
                  border: '1px dashed #e3e2e0'
                }}>
                  Bank transfer instructions will be sent via email after signup.
                </div>
              )}

              {/* Subtext terms */}
              <p style={{ margin: '14px 0 0', fontSize: '11px', color: 'rgba(55, 53, 47, 0.45)', lineHeight: 1.45 }}>
                By providing your card information, you allow Notion Labs, Inc. to charge your card for future payments in accordance with their terms.
              </p>
            </div>
          </div>

          {/* Right Column: Billing options, Add ons & Pricing Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Billing Options */}
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#5f5e5b', marginBottom: '8px' }}>
                Billing options
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Pay Monthly */}
                <div
                  onClick={() => setBillingOption('monthly')}
                  style={{
                    border: billingOption === 'monthly' ? '2px solid #2383e2' : '1.5px solid #e3e2e0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Custom radio indicator */}
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: billingOption === 'monthly' ? '5px solid #2383e2' : '1.5px solid #e3e2e0',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#37352f' }}>Pay monthly</span>
                    <span style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)', marginTop: '2px' }}>$10 / month / member</span>
                  </div>
                </div>

                {/* Pay Annually */}
                <div
                  onClick={() => setBillingOption('annual')}
                  style={{
                    border: billingOption === 'annual' ? '2px solid #2383e2' : '1.5px solid #e3e2e0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Custom radio indicator */}
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: billingOption === 'annual' ? '5px solid #2383e2' : '1.5px solid #e3e2e0',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }} />
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#37352f' }}>Pay annually</span>
                    <span style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)', marginTop: '2px' }}>$8 / month / member</span>
                  </div>
                  {/* Green badge */}
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#0b6e4f',
                    background: '#e2f6ec',
                    padding: '2px 8px',
                    borderRadius: '99px'
                  }}>
                    Save 20%
                  </span>
                </div>

              </div>
            </div>

            {/* Add ons */}
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#5f5e5b', marginBottom: '8px' }}>
                Add ons
              </div>
              
              <div
                onClick={() => setAddonChecked(prev => !prev)}
                style={{
                  border: addonChecked ? '2px solid #2383e2' : '1.5px solid #e3e2e0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  background: '#fff',
                  display: 'flex',
                  gap: '12px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                {/* Custom checkbox indicator */}
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '4px',
                  border: addonChecked ? 'none' : '1.5px solid #e3e2e0',
                  background: addonChecked ? '#2383e2' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {addonChecked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 1 3.5 6.5 1 4"/>
                    </svg>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#37352f', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    Spotline AI <span style={{ color: '#2383e2' }}>✦</span>
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)', marginTop: '2px' }}>$10 / month / member</span>
                  <span style={{ fontSize: '11.5px', color: 'rgba(55, 53, 47, 0.45)', marginTop: '5px', lineHeight: 1.4 }}>
                    Unlimited use of AI for Q&A, Autofill, Writer, and more.
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Summary & Upgrade button */}
            <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                <span style={{ fontSize: '23px', fontWeight: '700', letterSpacing: '-0.02em', color: '#37352f' }}>
                  ${totalPrice}
                  <span style={{ fontSize: '13px', fontWeight: '400', color: 'rgba(55, 53, 47, 0.5)', marginLeft: '4px' }}>
                    / month
                  </span>
                </span>
                <span style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  Details 
                  <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                    <path d="M1 1L4 4L7 1" stroke="rgba(55, 53, 47, 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>

              {/* Upgrade Button */}
              <button
                style={{
                  width: '100%',
                  height: '40px',
                  background: '#2383e2',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1b74cb'}
                onMouseLeave={e => e.currentTarget.style.background = '#2383e2'}
              >
                Upgrade to Plus
              </button>

              <p style={{ margin: '12px 0 0', fontSize: '11px', color: 'rgba(55, 53, 47, 0.45)', textAlign: 'center', lineHeight: 1.45 }}>
                By continuing, you agree to the{' '}
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Notion Terms and Conditions</span>.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
