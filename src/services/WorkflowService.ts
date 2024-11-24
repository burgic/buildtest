import { supabase } from '../lib/supabase';
import type { WorkflowSection } from '../types/workflow.types';
import { defaultSections } from '../config/WorkflowConfig';


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
  static async initializeClientWorkflow(userId: string, email: string): Promise<Workflow> {
    try {
      // First check for existing workflow for this user
      const { data: existingWorkflow, error: fetchError } = await supabase
        .from('workflows')
        .select('*')
        .eq('advisor_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If we found an existing workflow, check for link
      if (existingWorkflow) {
        const { data: existingLink, error: linkError } = await supabase
          .from('workflow_links')
          .select('*')
          .eq('workflow_id', existingWorkflow.id)
          .eq('client_email', email)
          .maybeSingle();

        if (linkError && linkError.code !== 'PGRST116') throw linkError;

        // If no link exists, create one
        if (!existingLink) {
          const { error: createLinkError } = await supabase
            .from('workflow_links')
            .insert({
              workflow_id: existingWorkflow.id,
              client_email: email,
              status: 'in_progress',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });

          if (createLinkError) throw createLinkError;
        }

        return existingWorkflow;
      }

      // If no workflow exists, create a new one
      const { data: newWorkflow, error: createError } = await supabase
        .from('workflows')
        .insert({
          advisor_id: userId,
          title: 'Financial Information Workflow',
          status: 'active',
          sections: defaultSections
        })
        .select()
        .single();

      if (createError) throw createError;

      // Now create the workflow link
      const { error: linkError } = await supabase
        .from('workflow_links')
        .insert({
          workflow_id: newWorkflow.id,
          client_email: email,
          status: 'in_progress',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (linkError) throw linkError;

      return newWorkflow;
    } catch (error) {
      console.error('Error initializing client workflow:', error);
      throw error;
    }
  }


  static async getWorkflowsByUser(userId: string): Promise<Workflow[]> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_links!inner(*)
        `)
        .eq('advisor_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user workflows:', error);
      throw new Error('Failed to fetch workflows');
    }
  }

  static async getWorkflowWithResponses(workflowId: string): Promise<Workflow & { responses: Record<string, any> }> {
    try {
      // Get workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (workflowError) throw workflowError;

      // Get responses
      const { data: responses, error: responsesError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('workflow_id', workflowId);

      if (responsesError) throw responsesError;

      // Convert responses array to object keyed by section_id
      const responsesMap = (responses || []).reduce((acc, response) => ({
        ...acc,
        [response.section_id]: response.data
      }), {});

      return {
        ...workflow,
        responses: responsesMap
      };
    } catch (error) {
      console.error('Error fetching workflow with responses:', error);
      throw new Error('Failed to fetch workflow data');
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
  static validateWorkflow(workflow: Workflow): boolean {
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