import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PaymentFlow.css';

const PaymentFlow = () => {
    const { inscricaoId } = useParams();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkPaymentStatus();
    }, [inscricaoId]);

    const checkPaymentStatus = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/payment/status/${inscricaoId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPaymentStatus(data);
            } else {
                setError('Erro ao verificar status do pagamento');
            }
        } catch (err) {
            setError('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentRedirect = () => {
        // Redireciona para o gateway de pagamento
        window.location.href = paymentStatus.payment_url;
    };

    if (loading) {
        return (
            <div className="payment-flow-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Verificando status do pagamento...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-flow-container">
                <div className="error-message">
                    <h2>❌ Erro</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/inscricoes')} className="btn-secondary">
                        Voltar para Inscrições
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-flow-container">
            <div className="payment-card">
                <h2>💳 Status do Pagamento</h2>
                
                {paymentStatus.has_payment ? (
                    <div className="payment-completed">
                        <div className="status-icon success">✅</div>
                        <h3>Pagamento Realizado</h3>
                        <div className="payment-details">
                            <div className="detail-row">
                                <span>Status do Pagamento:</span>
                                <span className={`status ${paymentStatus.payment_status}`}>
                                    {paymentStatus.payment_status === 'pago' ? '✅ Pago' : '⏳ Pendente'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span>Método:</span>
                                <span>{paymentStatus.payment_method}</span>
                            </div>
                            <div className="detail-row">
                                <span>Valor:</span>
                                <span>R$ {paymentStatus.payment_amount}</span>
                            </div>
                            <div className="detail-row">
                                <span>Data:</span>
                                <span>{paymentStatus.payment_date}</span>
                            </div>
                            <div className="detail-row">
                                <span>Status da Inscrição:</span>
                                <span className={`status ${paymentStatus.inscription_status}`}>
                                    {paymentStatus.inscription_status === 'confirmada' ? '✅ Confirmada' : '⏳ Pendente'}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/inscricoes')} 
                            className="btn-primary"
                        >
                            Ver Minhas Inscrições
                        </button>
                    </div>
                ) : (
                    <div className="payment-pending">
                        <div className="status-icon pending">⏳</div>
                        <h3>Pagamento Pendente</h3>
                        <p>Sua inscrição foi criada com sucesso, mas o pagamento ainda não foi realizado.</p>
                        
                        <div className="payment-info">
                            <div className="detail-row">
                                <span>Status da Inscrição:</span>
                                <span className="status pendente">⏳ Aguardando Pagamento</span>
                            </div>
                        </div>

                        <div className="payment-actions">
                            <button 
                                onClick={handlePaymentRedirect}
                                className="btn-payment"
                            >
                                💰 Realizar Pagamento
                            </button>
                            <button 
                                onClick={() => navigate('/inscricoes')} 
                                className="btn-secondary"
                            >
                                Pagar Depois
                            </button>
                        </div>

                        <div className="payment-help">
                            <h4>💡 Informações importantes:</h4>
                            <ul>
                                <li>Sua vaga está reservada por 24 horas</li>
                                <li>Após o pagamento, sua inscrição será confirmada automaticamente</li>
                                <li>Você pode realizar o pagamento a qualquer momento</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentFlow;
