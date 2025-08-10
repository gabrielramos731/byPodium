from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class EmailService:
    """Serviço para envio de emails relacionados a eventos"""
    
    @staticmethod
    def enviar_email_aprovacao(evento):
        """Envia email quando evento é aprovado"""
        try:
            organizador_email = evento.organizador.participante.email
            organizador_nome = evento.organizador.participante.nome
            
            subject = f'Evento "{evento.nome}" foi aprovado!'
            
            # Template HTML do email
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Evento Aprovado</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
                    .event-details {{ background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                    .success {{ color: #4CAF50; font-weight: bold; }}
                    .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Parabéns! Seu evento foi aprovado!</h1>
                    </div>
                    <div class="content">
                        <p>Olá, <strong>{organizador_nome}</strong>!</p>
                        
                        <p class="success">Temos o prazer de informar que seu evento foi aprovado por nossa equipe de administração!</p>
                        
                        <div class="event-details">
                            <h3>Detalhes do Evento:</h3>
                            <p><strong>Nome:</strong> {evento.nome}</p>
                            <p><strong>Data de Início:</strong> {evento.dataIni.strftime('%d/%m/%Y')}</p>
                            <p><strong>Data de Término:</strong> {evento.dataFim.strftime('%d/%m/%Y')}</p>
                            <p><strong>Local:</strong> {evento.localidade.cidade} - {evento.localidade.uf}</p>
                            <p><strong>Valor de Inscrição:</strong> R$ {evento.valorInsc}</p>
                        </div>
                        
                        <p>Seu evento já está disponível para visualização e inscrições dos participantes em nossa plataforma!</p>
                        
                        <p><strong>Próximos passos:</strong></p>
                        <ul>
                            <li>Acesse sua área do organizador para acompanhar as inscrições</li>
                            <li>Divulgue seu evento para aumentar o número de participantes</li>
                            <li>Gerencie categorias e kits conforme necessário</li>
                        </ul>
                        
                        <p>Agradecemos por escolher nossa plataforma para seu evento!</p>
                        
                        <p>Atenciosamente,<br>
                        <strong>Equipe byPodium</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este é um email automático, não responda a esta mensagem.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Versão em texto simples
            plain_message = f"""
            Parabéns! Seu evento foi aprovado!
            
            Olá, {organizador_nome}!
            
            Temos o prazer de informar que seu evento "{evento.nome}" foi aprovado por nossa equipe de administração!
            
            Detalhes do Evento:
            - Nome: {evento.nome}
            - Data de Início: {evento.dataIni.strftime('%d/%m/%Y')}
            - Data de Término: {evento.dataFim.strftime('%d/%m/%Y')}
            - Local: {evento.localidade.cidade} - {evento.localidade.uf}
            - Valor de Inscrição: R$ {evento.valorInsc}
            
            Seu evento já está disponível para visualização e inscrições dos participantes em nossa plataforma!
            
            Próximos passos:
            - Acesse sua área do organizador para acompanhar as inscrições
            - Divulgue seu evento para aumentar o número de participantes
            - Gerencie categorias e kits conforme necessário
            
            Agradecemos por escolher nossa plataforma para seu evento!
            
            Atenciosamente,
            Equipe byPodium
            """
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[organizador_email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return True
            
        except Exception as e:
            print(f"Erro ao enviar email de aprovação: {str(e)}")
            return False
    
    @staticmethod
    def enviar_email_negacao(evento, feedback_admin):
        """Envia email quando evento é negado com feedback"""
        try:
            organizador_email = evento.organizador.participante.email
            organizador_nome = evento.organizador.participante.nome
            
            subject = f'Evento "{evento.nome}" não foi aprovado'
            
            # Template HTML do email
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Evento Não Aprovado</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #f44336, #d32f2f); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
                    .event-details {{ background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                    .feedback-box {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                    .warning {{ color: #f44336; font-weight: bold; }}
                    .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Resultado da Análise do Evento</h1>
                    </div>
                    <div class="content">
                        <p>Olá, <strong>{organizador_nome}</strong>!</p>
                        
                        <p class="warning">Infelizmente, seu evento não foi aprovado por nossa equipe de administração.</p>
                        
                        <div class="event-details">
                            <h3>Evento Analisado:</h3>
                            <p><strong>Nome:</strong> {evento.nome}</p>
                            <p><strong>Data de Início:</strong> {evento.dataIni.strftime('%d/%m/%Y')}</p>
                            <p><strong>Local:</strong> {evento.localidade.cidade} - {evento.localidade.uf}</p>
                        </div>
                        
                        <div class="feedback-box">
                            <h3>Feedback da Administração:</h3>
                            <p><em>"{feedback_admin}"</em></p>
                        </div>
                        
                        <p><strong>O que fazer agora:</strong></p>
                        <ul>
                            <li>Revise as informações do seu evento com base no feedback recebido</li>
                            <li>Faça as correções necessárias</li>
                            <li>Crie um novo evento seguindo nossas diretrizes</li>
                            <li>Entre em contato conosco se tiver dúvidas</li>
                        </ul>
                        
                        <p>Não desanime! Estamos aqui para ajudar você a criar eventos incríveis.</p>
                        
                        <p>Atenciosamente,<br>
                        <strong>Equipe byPodium</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este é um email automático, não responda a esta mensagem.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Versão em texto simples
            plain_message = f"""
            Resultado da Análise do Evento
            
            Olá, {organizador_nome}!
            
            Infelizmente, seu evento "{evento.nome}" não foi aprovado por nossa equipe de administração.
            
            Evento Analisado:
            - Nome: {evento.nome}
            - Data de Início: {evento.dataIni.strftime('%d/%m/%Y')}
            - Local: {evento.localidade.cidade} - {evento.localidade.uf}
            
            Feedback da Administração:
            "{feedback_admin}"
            
            O que fazer agora:
            - Revise as informações do seu evento com base no feedback recebido
            - Faça as correções necessárias
            - Crie um novo evento seguindo nossas diretrizes
            - Entre em contato conosco se tiver dúvidas
            
            Não desanime! Estamos aqui para ajudar você a criar eventos incríveis.
            
            Atenciosamente,
            Equipe byPodium
            """
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[organizador_email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return True
            
        except Exception as e:
            print(f"Erro ao enviar email de negação: {str(e)}")
            return False
