// src/services/DocumentService.ts
import { createWorker } from 'tesseract.js';
import { supabase } from '../lib/supabase';

export class DocumentService {
  static async uploadDocument(
    workflowLinkId: string,
    file: File,
    documentType: 'bank_statement' | 'payslip' | 'utility_bill'
  ) {
    // Upload file to Supabase Storage
    const filename = `${workflowLinkId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filename, file);

    if (uploadError) throw uploadError;

    // Process with OCR
    const extractedData = await this.processOCR(file, documentType);

    // Save document record
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        workflow_link_id: workflowLinkId,
        file_path: filename,
        original_filename: file.name,
        extracted_data: extractedData
      })
      .select()
      .single();

    if (documentError) throw documentError;
    return documentData;
  }

  private static async processOCR(file: File, documentType: string) {
    const worker = await createWorker('eng');
    const imageData = await this.fileToImage(file);
    const { data: { text } } = await worker.recognize(imageData);
    await worker.terminate();

    // Process extracted text based on document type
    return this.parseDocumentText(text, documentType);
  }

  private static async fileToImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private static parseDocumentText(text: string, documentType: string) {
    // Add specific parsing logic for different document types
    switch (documentType) {
      case 'bank_statement':
        return this.parseBankStatement(text);
      case 'payslip':
        return this.parsePayslip(text);
      case 'utility_bill':
        return this.parseUtilityBill(text);
      default:
        return { raw_text: text };
    }
  }

  private static parseBankStatement(text: string) {
    // Add regex patterns to extract relevant information
    const balanceMatch = text.match(/Balance:?\s*[$£€]?([\d,]+\.?\d*)/i);
    const accountMatch = text.match(/Account\s*#?:?\s*(\d+)/i);

    return {
      balance: balanceMatch ? balanceMatch[1] : null,
      account_number: accountMatch ? accountMatch[1] : null,
      raw_text: text
    };
  }

  private static parsePayslip(text: string) {
    // Add regex patterns for payslip information
    const grossMatch = text.match(/Gross\s*Pay:?\s*[$£€]?([\d,]+\.?\d*)/i);
    const netMatch = text.match(/Net\s*Pay:?\s*[$£€]?([\d,]+\.?\d*)/i);

    return {
      gross_pay: grossMatch ? grossMatch[1] : null,
      net_pay: netMatch ? netMatch[1] : null,
      raw_text: text
    };
  }

  private static parseUtilityBill(text: string) {
    // Add regex patterns for utility bill information
    const amountMatch = text.match(/Amount\s*Due:?\s*[$£€]?([\d,]+\.?\d*)/i);
    const dateMatch = text.match(/Due\s*Date:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);

    return {
      amount_due: amountMatch ? amountMatch[1] : null,
      due_date: dateMatch ? dateMatch[1] : null,
      raw_text: text
    };
  }
}