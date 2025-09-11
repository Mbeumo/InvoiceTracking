from django.contrib import admin

from .models import Invoice, InvoiceComment, InvoiceTemplate


"""@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "phone"]
    search_fields = ["name", "email"]
    ordering = ["name"]
"""


@admin.register(InvoiceTemplate)
class InvoiceTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "enabled", "created_at"]
    list_filter = ["enabled", "detection_keywords", "created_at"]
    search_fields = ["name", "user"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["number", "vendor_name", "total_amount", "currency", "status", "due_date", "created_by", "created_at"]
    list_filter = ["status", "currency", "due_date", "created_at", "vendor_name"]
    search_fields = ["number", "raw_text", "created_by"]
    readonly_fields = ["raw_text", "ocr_confidence", "matched_template", "created_at", "updated_at"]
    date_hierarchy = "created_at"
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("created_by", "vendor_name","vendor_email","vendor_phone", "number", "total_amount", "currency")
        }),
        ("Dates", {
            "fields": ("issue_date","invoice_date", "due_date","payment_date")
        }),
        ("Status", {
            "fields": ("status",)
        }),
        ("OCR Results", {
            "fields": ("raw_text", "ocr_confidence", "matched_template"),
            "classes": ("collapse",)
        }),
        ("File", {
            "fields": ("file",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        })
    )


@admin.register(InvoiceComment)
class InvoiceCommentAdmin(admin.ModelAdmin):
    list_display = ["invoice", "user", "comment_preview", "created_at"]
    list_filter = ["created_at", "user"]
    search_fields = ["comment", "invoice", "user"]
    readonly_fields = ["created_at"]
    
    def comment_preview(self, obj):
        return obj.comment[:50] + "..." if len(obj.comment) > 50 else obj.comment
    comment_preview.short_description = "Comment"
    #list_filter = ("enabled",) 