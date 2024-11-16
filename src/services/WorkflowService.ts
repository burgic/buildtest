import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowService {
  static async createWorkflow(advisorId: string, title: string, sections: any[]) {
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        advisor_id: advisorId,
        title,
        sections
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async generateWorkflowLink(workflowId: string, clientEmail: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Link expires in 30 days

    const { data, error } = await supabase
      .from('workflow_links')
      .insert({
        workflow_id: workflowId,
        client_email: clientEmail,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async saveFormResponse(workflowLinkId: string, sectionId: string, formData: any) {
    const { data, error } = await supabase
      .from('form_responses')
      .insert({
        workflow_link_id: workflowLinkId,
        section_id: sectionId,
        data: formData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getWorkflowResponses(workflowLinkId: string) {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('workflow_link_id', workflowLinkId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
}