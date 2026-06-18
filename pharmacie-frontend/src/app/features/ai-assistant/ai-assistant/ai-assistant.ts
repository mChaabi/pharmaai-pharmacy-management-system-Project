// ai-assistant.component.ts — version corrigée complète

import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AiResponse, AiService } from '../../../core/services/ai';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    type?: string;
    dureeMs?: number;
    timestamp: Date;
}

@Component({
    selector: 'app-ai-assistant',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ButtonModule, InputTextModule,
        TextareaModule, SelectModule,
        TagModule, ProgressSpinnerModule
    ],
    templateUrl: './ai-assistant.html',
    styleUrl: './ai-assistant.scss'
})
export class AiAssistantComponent {

    messages: ChatMessage[] = [];
    question = '';
    isLoading = false;
    typeQuestion = 'question';

    typeOptions = [
        { label: '💬 Question libre',         value: 'question' },
        { label: '⚠️ Interactions',           value: 'interaction' },
        { label: '📋 Analyser ordonnance',    value: 'ordonnance' },
        { label: '💊 Conseils posologie',     value: 'posologie' },
        { label: '🔄 Alternative médicament', value: 'alternative' }
    ];

    questionsRapides = [
        'Effets secondaires du Paracétamol ?',
        'Posologie Amoxicilline adulte ?',
        'Interactions Ibuprofène + Aspirine ?',
        'Conservation des insulines ?',
        'Médicaments contre-indiqués pendant grossesse ?'
    ];

    // ✅ Injecter ChangeDetectorRef
    constructor(
        private aiService: AiService,
        private cdr: ChangeDetectorRef
    ) {
        this.messages.push({
            role: 'assistant',
            content: '👋 Bonjour ! Je suis PharmAI, votre assistant pharmacien. Comment puis-je vous aider ?',
            timestamp: new Date()
        });
    }

    envoyer(): void {
        if (!this.question.trim() || this.isLoading) return;

        const userQuestion = this.question;
        this.question = '';

        // Ajoute message utilisateur
        this.messages = [...this.messages, {
            role: 'user',
            content: userQuestion,
            timestamp: new Date()
        }];

        this.isLoading = true;
        this.cdr.detectChanges(); // ✅ Force affichage message user
        this.scrollToBottom();

        // Choisit le bon endpoint
        let observable;
        switch (this.typeQuestion) {
            case 'interaction':
                const meds = userQuestion.split(',').map(m => m.trim());
                observable = this.aiService.verifierInteractions(meds);
                break;
            case 'ordonnance':
                observable = this.aiService.analyserOrdonnance(userQuestion);
                break;
            case 'posologie':
                observable = this.aiService.conseilsPosologie(userQuestion, 'adulte');
                break;
            case 'alternative':
                observable = this.aiService.suggererAlternative(userQuestion);
                break;
            default:
                observable = this.aiService.poserQuestion(userQuestion);
        }

        observable.subscribe({
            next: (response: AiResponse) => {
                // ✅ Crée nouveau tableau pour forcer la détection
                this.messages = [...this.messages, {
                    role: 'assistant',
                    content: response.reponse,
                    type: response.type,
                    dureeMs: response.dureeMs,
                    timestamp: new Date()
                }];
                this.isLoading = false;
                this.cdr.detectChanges(); // ✅ CRUCIAL — force l'affichage
                this.scrollToBottom();
            },
            error: () => {
                this.messages = [...this.messages, {
                    role: 'assistant',
                    content: '❌ Erreur de connexion au service AI.',
                    timestamp: new Date()
                }];
                this.isLoading = false;
                this.cdr.detectChanges(); // ✅
            }
        });
    }

    utiliserQuestionRapide(q: string): void {
        this.question = q;
        this.envoyer();
    }

    effacerChat(): void {
        this.messages = [{
            role: 'assistant',
            content: '🔄 Chat effacé. Comment puis-je vous aider ?',
            timestamp: new Date()
        }];
        this.cdr.detectChanges();
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            const chat = document.querySelector('.chat-messages');
            if (chat) chat.scrollTop = chat.scrollHeight;
        }, 100);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.envoyer();
        }
    }
}
