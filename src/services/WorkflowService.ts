import { supabase } from '../lib/supabase';

import type { WorkflowSection } from '../types/workflow.types';


// Type definitions
export interface Workflow {
  id: string;
  title: string;
  advisor_id: string;
  sections: WorkflowSection[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface FormResponse {
  id: string;
  workflow_id: string;
  section_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class WorkflowService {
  static async createWorkflow(advisorId: string, title: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        advisor_id: advisorId,
        title: title,
        status: 'draft',
        sections: []
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getWorkflow(workflowId: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getWorkflowByAdvisor(advisorId: string): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('advisor_id', advisorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', workflowId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async archiveWorkflow(workflowId: string): Promise<void> {
    const { error } = await supabase
      .from('workflows')
      .update({ status: 'archived' })
      .eq('id', workflowId);

    if (error) throw error;
  }

  // Form Response operations
  static async saveFormResponse(
    workflowId: string,
    sectionId: string,
    data: Record<string, any>
  ): Promise<FormResponse> {
    console.log('Saving form response:', { workflowId, sectionId, data });

    const { data: response, error } = await supabase
      .from('form_responses')
      .insert({
        workflow_id: workflowId,
        section_id: sectionId,
        data: data
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving form response:', error);
      throw error;
    }

    return response;
  }

  static async getFormResponses(workflowId: string): Promise<FormResponse[]> {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getLatestFormResponses(workflowId: string): Promise<Record<string, FormResponse>> {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by section_id and take the latest response for each section
    const latestResponses = data.reduce((acc, response) => {
      if (!acc[response.section_id] || 
          new Date(response.created_at) > new Date(acc[response.section_id].created_at)) {
        acc[response.section_id] = response;
      }
      return acc;
    }, {} as Record<string, FormResponse>);

    return latestResponses;
  }

  // Workflow Link operations
  static async createWorkflowLink(workflowId: string, clientEmail: string): Promise<string> {
    const { data, error } = await supabase
      .from('workflow_links')
      .insert({
        workflow_id: workflowId,
        client_email: clientEmail,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  static async getWorkflowByLinkId(linkId: string): Promise<Workflow | null> {
    const { data: link, error: linkError } = await supabase
      .from('workflow_links')
      .select('workflow_id, status, expires_at')
      .eq('id', linkId)
      .single();

    if (linkError) throw linkError;

    if (!link || new Date(link.expires_at) < new Date() || link.status === 'completed') {
      return null;
    }

    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', link.workflow_id)
      .single();

    if (workflowError) throw workflowError;
    return workflow;
  }

  // Real-time subscription setup
  static subscribeToFormResponses(
    workflowId: string,
    callback: (response: FormResponse) => void
  ) {
    return supabase
      .channel(`workflow-${workflowId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'form_responses',
          filter: `workflow_id=eq.${workflowId}`
        },
        (payload) => {
          callback(payload.new as FormResponse);
        }
      )
      .subscribe();
  }

  
  // Workflow validation
  static validateWorkflowData(workflow: Workflow): boolean {
    if (!workflow.sections || !Array.isArray(workflow.sections)) {
        return false;
    }

    for (const section of workflow.sections) {
        if (!section.id || !section.title || !Array.isArray(section.fields)) {
            return false;
        }

        for (const field of section.fields) {
            if (!field.id || !field.label || !field.type || !['text', 'number', 'email', 'tel', 'select', 'date', 'file'].includes(field.type)) {
                return false;
            }
        }
    }

    return true;
}
    
}