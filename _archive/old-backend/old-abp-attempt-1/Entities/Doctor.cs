using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace LowBackPainSystem.Entities
{
    /// <summary>
    /// 医生实体
    /// Doctor entity
    /// </summary>
    public class Doctor : FullAuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// 所属工作室ID
        /// Workspace ID
        /// </summary>
        public Guid WorkspaceId { get; set; }

        /// <summary>
        /// 医生姓名
        /// Doctor name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 工号
        /// Employee ID
        /// </summary>
        public string EmployeeId { get; set; }

        /// <summary>
        /// 专业/科室
        /// Specialty/Department
        /// </summary>
        public string Specialty { get; set; }

        /// <summary>
        /// 联系电话
        /// Contact phone
        /// </summary>
        public string Phone { get; set; }

        /// <summary>
        /// 邮箱
        /// Email
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// 是否启用
        /// Is active
        /// </summary>
        public bool IsActive { get; set; }

        protected Doctor()
        {
        }

        public Doctor(
            Guid id,
            Guid workspaceId,
            string name,
            string employeeId = null
        ) : base(id)
        {
            WorkspaceId = workspaceId;
            Name = name;
            EmployeeId = employeeId;
            IsActive = true;
        }

        public void SetActive(bool isActive)
        {
            IsActive = isActive;
        }
    }
}
