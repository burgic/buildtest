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

export interface WorkflowLink {
  id: string;
  workflow_id: string;
  client_email: string;
  status: 'pending' | 'in_progress' | 'completed';
  expires_at: string;
  created_at: string;
}

export class WorkflowService {
  // Client Workflow Methods
  static async initializeClientWorkflow(userId: string, email: string): Promise<Workflow> {
    try {
      const { data: existingLinks, error: linkError } = await supabase
        .from('workflow_links')
        .select('workflow_id')
        .eq('client_email', email)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (linkError) throw linkError;

      if (existingLinks?.workflow_id) {
        const { data: workflow, error: fetchError } = await supabase
          .from('workflows')
          .select('*')
          .eq('id', existingLinks.workflow_id)
          .single();

        if (fetchError) throw fetchError;
        if (workflow) return workflow;
      }

      const { data: newWorkflow, error: createError } = await supabase
        .from('workflows')
        .insert({
          advisor_id: userId,
          title: 'Financial Information Workflow',
          status: 'active',
          sections: []
        })
        .select()
        .single();

      if (createError) throw createError;

      const { error: linkCreateError } = await supabase
        .from('workflow_links')
        .insert({
          workflow_id: newWorkflow.id,
          client_email: email,
          status: 'in_progress',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (linkCreateError) throw linkCreateError;

      return newWorkflow;
    } catch (error) {
      console.error('Error initializing client workflow:', error);
      throw new Error('Failed to initialize workflow');
    }
  }


  static async getWorkflow(workflowId: string): Promise<Workflow> {
    try {
      const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error) throw error;
    return data;
    } catch (error) {
        console.error('Error updating workflow:', error);
        throw new Error('Failed to update workflow');
    }
  }

  static async getWorkflowByAdvisor(advisorId: string): Promise<Workflow[]> {
    try {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('advisor_id', advisorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching advisor workflows:', error);
    throw new Error('Failed to fetch workflows');
  }

  }

  static async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', workflowId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw new Error('Failed to update workflow');
    }
  }

  static async archiveWorkflow(workflowId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ status: 'archived' })
        .eq('id', workflowId);

      if (error) throw error;
    } catch (error) {
      console.error('Error archiving workflow:', error);
      throw new Error('Failed to archive workflow');
    }
  }

  // Form Response operations
  static async saveFormResponse(
    workflowId: string,
    sectionId: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('form_responses')
        .select('id')
        .eq('workflow_id', workflowId)
        .eq('section_id', sectionId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing?.id) {
        const { error: updateError } = await supabase
          .from('form_responses')
          .update({ data })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('form_responses')
          .insert({
            workflow_id: workflowId,
            section_id: sectionId,
            data
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error saving form response:', error);
      throw new Error('Failed to save form response');
    }
  }

  static async getFormResponses(workflowId: string): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('workflow_id', workflowId);

      if (error) throw error;

      return (data || []).reduce((acc, response) => {
        acc[response.section_id] = response.data;
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error('Error fetching form responses:', error);
      throw new Error('Failed to fetch form responses');
    }
  }

  static async getLatestFormResponses(workflowId: string): Promise<Record<string, FormResponse>> {
    try {
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
    } catch (error) {
      console.error('Error fetching latest form responses:', error);
      throw new Error('Failed to fetch latest responses');
    }
  }

  // Workflow Link Methods
  static async createWorkflowLink(workflowId: string, clientEmail: string): Promise<WorkflowLink> {
    try {
      const { data, error } = await supabase
        .from('workflow_links')
        .insert({
          workflow_id: workflowId,
          client_email: clientEmail,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workflow link:', error);
      throw new Error('Failed to create workflow link');
    }
  }

  static async getWorkflowByLinkId(linkId: string): Promise<Workflow | null> {
    try {
      const { data: link, error: linkError } = await supabase
        .from('workflow_links')
        .select('workflow_id, status, expires_at')
        .eq('id', linkId)
        .single();

      if (linkError) throw linkError;

      // Check if link is valid
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
    } catch (error) {
      console.error('Error fetching workflow by link:', error);
      throw new Error('Failed to fetch workflow');
    }
  }

  static async updateWorkflowLink(
    linkId: string, 
    updates: Partial<Pick<WorkflowLink, 'status' | 'expires_at'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_links')
        .update(updates)
        .eq('id', linkId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating workflow link:', error);
      throw new Error('Failed to update workflow link');
    }
  }


  // Real-time subscription setup
  static subscribeToFormResponses(
    workflowId: string,
    callback: (response: any) => void
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